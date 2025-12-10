


import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getInitialDashboardData, getWordCloudData, getTicketsByCategoryAndPriority } from '../../services/api';
import { socketService } from '../../services/socketService';
import { SAP_MODULE_FULL_NAMES, SAP_MODULE_REVERSE_NAMES } from '../../constants';
import type { Kpis, RootCauseData, HeatmapDataPoint, SimilarTicket } from '../../types';
import KpiCard from './charts/KpiCard';
import RootCauseFunnel from './charts/RootCauseFunnel';
import WordCloud from './charts/WordCloud';
import ImpactHeatmap from './charts/ImpactHeatmap';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';

const DashboardView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [rootCauses, setRootCauses] = useState<RootCauseData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [wordCloudData, setWordCloudData] = useState<{ word: string, value: number }[]>([]);
  const [isWordCloudLoading, setIsWordCloudLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  // State for the interactive heatmap modal
  const [modalData, setModalData] = useState<{ title: string; tickets: SimilarTicket[] } | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SimilarTicket | null>(null);

  
  const priorityDisplayMap: Record<string, string> = { p1: 'High', p2: 'Medium', p3: 'Low' };

  const handleBarClick = useCallback((cause: string) => {
    if (selectedCause === cause) {
        setSelectedCause(null);
        setWordCloudData([]);
        return;
    }
    setSelectedCause(cause);
    setIsWordCloudLoading(true);
    const shortCause = SAP_MODULE_REVERSE_NAMES[cause] || cause;
    getWordCloudData(shortCause).then(data => {
        setWordCloudData(data);
        setIsWordCloudLoading(false);
    });
  }, [selectedCause]);
  
  const handleHeatmapCellClick = async (category: string, priority: string) => {
    const title = `Loading tickets for ${category} / ${priorityDisplayMap[priority] || priority}...`;

    setIsModalLoading(true);
    setModalData({ title, tickets: [] });
    
    const shortCategory = SAP_MODULE_REVERSE_NAMES[category] || category;
    const tickets = await getTicketsByCategoryAndPriority(shortCategory, priority);
    
    setModalData({
        title: `${tickets.length} ${priorityDisplayMap[priority] || priority} tickets for ${category}`,
        tickets: tickets
    });
    setIsModalLoading(false);
  };

  // Effect 1: Load all initial data and set up sockets. Runs once.
  useEffect(() => {
    getInitialDashboardData().then(data => {
      setKpis(data.kpis);
      setRootCauses(data.rootCauses);
      setHeatmapData(data.heatmap);
      setLoading(false);
    });

    socketService.connect();

    socketService.on('kpi_update', (update: Partial<Kpis>) => {
      setKpis(prev => prev ? { ...prev, ...update } : null);
    });

    socketService.on('heatmap_update', (update: HeatmapDataPoint) => {
      setHeatmapData(prev => {
        const newData = [...prev];
        const index = newData.findIndex(d => d.category === update.category && d.priority === update.priority);
        if (index > -1) {
          newData[index].value += update.value;
        }
        return newData;
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Effect 2: Respond to filter changes from URL or set initial default view.
  useEffect(() => {
    if (loading) return; // Wait until data is loaded

    const filter = searchParams.get('filter');
    const validCauses = new Set(rootCauses.map(rc => SAP_MODULE_FULL_NAMES[rc.name] || rc.name));

    if (filter && validCauses.has(filter)) {
      // A valid filter is present. If it's not already selected, update the view.
      if (selectedCause !== filter) {
        setSelectedCause(filter);
        setIsWordCloudLoading(true);
        const shortCause = SAP_MODULE_REVERSE_NAMES[filter] || filter;
        getWordCloudData(shortCause).then(data => {
            setWordCloudData(data);
            setIsWordCloudLoading(false);
        });
      }
    } else if (!selectedCause && rootCauses.length > 0) {
      // No filter, and nothing is selected yet (initial load case). Default to the first cause.
      const firstCauseFullName = SAP_MODULE_FULL_NAMES[rootCauses[0].name] || rootCauses[0].name;
      setSelectedCause(firstCauseFullName);
      setIsWordCloudLoading(true);
      getWordCloudData(rootCauses[0].name).then(data => {
          setWordCloudData(data);
          setIsWordCloudLoading(false);
      });
    }
  }, [searchParams, loading, rootCauses, selectedCause]);


  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Ticket Deflection Rate" value={`${kpis?.deflectionRate.toFixed(1)}%`} />
        <KpiCard title="Avg. Time to Resolution" value={`${kpis?.avgTimeToResolution.toFixed(1)} hrs`} />
        <KpiCard title="First Contact Resolution" value={`${kpis?.firstContactResolution.toFixed(1)}%`} />
      </div>

      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border h-96 flex flex-col">
        <h3 className="text-lg font-semibold mb-1">Top Root Causes</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click a tile to explore related keywords.</p>
        <div className="flex-grow">
          {rootCauses.length > 0 ? (
              <RootCauseFunnel data={rootCauses.map(rc => ({ ...rc, name: SAP_MODULE_FULL_NAMES[rc.name] || rc.name }))} onBarClick={handleBarClick} selectedCause={selectedCause} />
          ) : (
              <div className="flex h-full items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <p>Train a model from the Knowledge Base page to see root cause analysis.</p>
              </div>
          )}
        </div>
      </div>
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border h-96 flex flex-col">
        <div className="flex items-center mb-1">
            <h3 className="text-lg font-semibold mr-2">
            Problem Keywords
            </h3>
            <div className="group relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 hover:text-light-accent dark:hover:text-dark-accent cursor-help transition-colors">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                    AI extracts these frequent terms from ticket descriptions associated with the selected root cause to identify specific recurring patterns.
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
            </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
           For: <span className="font-semibold text-light-accent dark:text-dark-accent">{selectedCause || '...'}</span>
        </p>
         <div className="flex-grow">
           {rootCauses.length > 0 ? (
            <WordCloud data={wordCloudData} isLoading={isWordCloudLoading} />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <p>No root causes to analyze.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border">
        <h3 className="text-lg font-semibold mb-1">Business Impact Heatmap</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ticket volume by category and priority. Click a cell to view tickets.</p>
        {heatmapData.length > 0 ? (
          <ImpactHeatmap data={heatmapData.map(d => ({ ...d, category: SAP_MODULE_FULL_NAMES[d.category] || d.category }))} onCellClick={handleHeatmapCellClick} />
        ) : (
          <div className="flex-grow flex items-center justify-center text-center text-gray-500 dark:text-gray-400 min-h-[200px]">
            <p>Train a model from the Knowledge Base page to see the business impact heatmap.</p>
          </div>
        )}
      </div>

       {/* Ticket List Modal */}
       {modalData && (
        <Modal
            isOpen={!!modalData}
            onClose={() => setModalData(null)}
            title={modalData.title}
        >
            {isModalLoading ? (
                <div className="h-48 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-4">
                    <div className="space-y-3">
                        {modalData.tickets.map(ticket => (
                            <button
                                key={ticket.ticket_no}
                                onClick={() => setSelectedTicket(ticket)}
                                className="w-full text-left p-3 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-light-border dark:border-dark-border text-sm transition-all duration-300 hover:ring-2 hover:ring-light-accent/50 dark:hover:ring-dark-accent/50 hover:shadow-lg group"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-light-text dark:text-dark-text pr-4 group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">{ticket.problem_description}</p>
                                    <span className="ml-4 flex-shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400">{ticket.ticket_no}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Technician: <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.technician || 'N/A'}</span>
                                    <span className="mx-2">|</span>
                                    Status: <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.request_status || 'N/A'}</span>
                                    <span className="float-right text-light-accent/80 dark:text-dark-accent/80 opacity-0 group-hover:opacity-100 transition-opacity">View details...</span>
                                </div>
                            </button>
                        ))}
                        {modalData.tickets.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No tickets found for this selection.</p>
                        )}
                    </div>
                </div>
            )}
        </Modal>
      )}
      
      {/* Ticket Detail Modal */}
      {selectedTicket && (
            <Modal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                title={`Ticket Details: #${selectedTicket.ticket_no}`}
            >
                <div className="space-y-4">
                    <p className="font-semibold text-base text-light-text dark:text-dark-text pb-4 border-b border-light-border/50 dark:border-dark-border/50">
                        {selectedTicket.problem_description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Category</p>
                            <p>{SAP_MODULE_FULL_NAMES[selectedTicket.category || ''] || selectedTicket.category || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Priority</p>
                            <p>{priorityDisplayMap[selectedTicket.priority || ''] || selectedTicket.priority || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Request Type</p>
                            <p>{selectedTicket.request_type || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Status</p>
                            <p>{selectedTicket.request_status || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Technician</p>
                            <p>{selectedTicket.technician || 'N/A'}</p>
                        </div>
                        <div/>
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Created</p>
                            <p>{selectedTicket.created_time ? new Date(selectedTicket.created_time).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Responded</p>
                            <p>{selectedTicket.responded_time ? new Date(selectedTicket.responded_time).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400 text-xs">Due By</p>
                            <p>{selectedTicket.due_by_time ? new Date(selectedTicket.due_by_time).toLocaleString() : 'N/A'}</p>
                        </div>
                    </div>
                    
                    {selectedTicket.solution_text && (
                        <div className="pt-4 border-t border-light-border/50 dark:border-dark-border/50">
                            <h5 className="font-semibold text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 tracking-wider">Solution Text</h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-slate-100 dark:bg-gray-900/40 p-3 rounded-md whitespace-pre-wrap">
                                {selectedTicket.solution_text}
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        )}
    </div>
  );
};

export default DashboardView;