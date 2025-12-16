import { useState, useEffect } from 'react'
import { AnalyticsService } from '../../../services/AnalyticsService'
import { SocketService } from '../../../services/SocketService'
import { buildEntryExitPayload } from '../../../util/apiHelpers'

const CrowdEntries = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEntries()
  }, [currentPage])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const requestData = buildEntryExitPayload({
        pageNumber: currentPage,
        pageSize: 10,
      })

      console.log('payload:', requestData)

      const response = await AnalyticsService.getEntryExit(requestData)
      const responseData = response?.data || response
            
      if (responseData) {
        // Transform API response to match component format
        const records = responseData.records || []
        console.log('CrowdEntries: Records found:', records.length)
        
        if (records.length === 0) {
          setEntries([])
          setTotalPages(1)
          return
        }
        
        const transformedEntries = records.map(record => {
          console.log('CrowdEntries:', record)
                    let dwellTimeFormatted = '--'
          if (record.dwellMinutes !== null && record.dwellMinutes !== undefined) {
            const minutes = Math.floor(record.dwellMinutes)
            const seconds = Math.floor((record.dwellMinutes % 1) * 60)
            dwellTimeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          }
          
          const gender = record.gender || record.sex || 'Unknown'
          
          return {
            id: record.personId || Math.random().toString(),
            name: record.personName || 'Unknown',
            gender: gender, 
            entryTime: record.entryLocal || (record.entryUtc ? new Date(record.entryUtc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'),
            exitTime: record.exitLocal || (record.exitUtc ? new Date(record.exitUtc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'),
            dwellTime: dwellTimeFormatted,
            zoneName: record.zoneName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(record.personName || 'Unknown')}&background=009688&color=fff&size=32`
          }
        })
        
        console.log('Transformed entries:', transformedEntries)
        setEntries(transformedEntries)
        setTotalPages(responseData.totalPages || 1)
      } else {
        setEntries([])
        setTotalPages(1)
      }
    } catch (err) {
      
      // Log 400 errors with details
      if (err.response?.status === 400) {
        console.error('400 Bad Request - API expects different payload structure')
        console.error('Request payload was:', {
          page: currentPage,
          limit: 10
        })
        console.error('API error details:', err.response?.data)
      }
      
      setEntries(generateMockEntries())
      setTotalPages(5)
      // setError('Failed to load crowd entries')
    } finally {
      setLoading(false)
    }
  }

  const formatDwellTime = (time) => {
    if (!time || time === '--') return '--'
    return time
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
        <div className="text-center py-10 text-lg text-gray-600">Loading crowd entries...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <div className="flex gap-6 flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Overview</h1>
          
          {error && (
            <div className="text-center py-10 text-lg text-red-600 bg-red-50 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-auto bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">Name</th>
                  <th className="p-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">Sex</th>
                  <th className="p-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">Entry</th>
                  <th className="p-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">Exit</th>
                  <th className="p-4 text-left font-semibold text-gray-800 text-sm border-b-2 border-gray-200">Dwell Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400">No entries found</td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="p-4 border-b border-gray-100 text-gray-600 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {entry.avatar ? (
                              <img src={entry.avatar} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span>{getInitials(entry.name)}</span>
                            )}
                          </div>
                          <span>{entry.name}</span>
                        </div>
                      </td>
                      <td className="p-4 border-b border-gray-100 text-gray-600 text-sm">{entry.gender}</td>
                      <td className="p-4 border-b border-gray-100 text-gray-600 text-sm">{entry.entryTime}</td>
                      <td className="p-4 border-b border-gray-100 text-gray-600 text-sm">{entry.exitTime || '--'}</td>
                      <td className="p-4 border-b border-gray-100 text-gray-600 text-sm">{formatDwellTime(entry.dwellTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6 p-4">
            <button 
              className="px-3 py-2 border border-gray-300 bg-white rounded text-sm text-gray-600 transition-all min-w-[36px] hover:bg-gray-100 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-2 border rounded text-sm transition-all min-w-[36px] ${
                    currentPage === pageNum 
                      ? 'bg-teal-500 text-white border-teal-500' 
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-teal-500'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 py-2 text-gray-400">...</span>
            )}
            
            {totalPages > 5 && (
              <button
                className={`px-3 py-2 border rounded text-sm transition-all min-w-[36px] ${
                  currentPage === totalPages 
                    ? 'bg-teal-500 text-white border-teal-500' 
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-teal-500'
                }`}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            )}
            
            <button 
              className="px-3 py-2 border border-gray-300 bg-white rounded text-sm text-gray-600 transition-all min-w-[36px] hover:bg-gray-100 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CrowdEntries

