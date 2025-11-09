import { useState } from 'react'
import { testConnection } from '../lib/supabase'

export default function ConnectionTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    const testResult = await testConnection()
    setResult(testResult)
    setLoading(false)
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>Test połączenia z bazą danych</h2>
      <button 
        onClick={handleTest} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testowanie...' : 'Testuj połączenie'}
      </button>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <h3 style={{ color: result.success ? '#155724' : '#721c24' }}>
            {result.success ? '✅ Sukces' : '❌ Błąd'}
          </h3>
          <p><strong>Status:</strong> {result.success ? result.message : result.error}</p>
          {result.details && (
            <pre style={{ 
              backgroundColor: '#fff', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(result.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Tip:</strong> Możesz też wywołać test z konsoli przeglądarki:</p>
        <code style={{ 
          display: 'block', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          marginTop: '5px'
        }}>
          testSupabaseConnection()
        </code>
      </div>
    </div>
  )
}


