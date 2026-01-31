import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useNews } from '../hooks/useNews'
import { useAuth } from '../hooks/useAuth'
import './admin-news-manager.css'

export default function AdminNewsManager() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [selectedNewsId, setSelectedNewsId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: news, isLoading } = useNews()
  
  const selectedNews = news?.find(n => n.id === selectedNewsId)

  const addNewsMutation = useMutation({
    mutationFn: async (newsData: { title: string; content: string; author_id: string }) => {
      const { data, error } = await supabase
        .from('news')
        .insert([newsData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      setSuccess('News został dodany!')
      setTitle('')
      setContent('')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy dodawaniu newsa')
      setTimeout(() => setError(null), 5000)
    },
  })

  const updateNewsMutation = useMutation({
    mutationFn: async (newsData: {
      newsId: string
      title: string
      content: string
    }) => {
      const { data, error } = await supabase
        .from('news')
        .update({
          title: newsData.title,
          content: newsData.content
        })
        .eq('id', newsData.newsId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      setSuccess('News został zaktualizowany!')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy aktualizacji newsa')
      setTimeout(() => setError(null), 5000)
    },
  })

  const deleteNewsMutation = useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId)

      if (error) {
        console.error('Błąd przy usuwaniu newsa:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      setSuccess('News został usunięty!')
      setSelectedNewsId('')
      setShowDeleteConfirm(false)
      // Wyczyść formularz
      setTitle('')
      setContent('')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy usuwaniu newsa')
      setTimeout(() => setError(null), 5000)
    },
  })

  const handleNewsSelect = (newsId: string) => {
    setSelectedNewsId(newsId)
    const newsItem = news?.find(n => n.id === newsId)
    if (newsItem && mode === 'edit') {
      // Wypełnij formularz danymi newsa
      setTitle(newsItem.title || '')
      setContent(newsItem.content || '')
    }
    setError(null)
    setSuccess(null)
    setShowDeleteConfirm(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim() || !content.trim()) {
      setError('Wypełnij wszystkie wymagane pola')
      return
    }

    if (!user) {
      setError('Musisz być zalogowany')
      return
    }

    if (mode === 'edit' && selectedNewsId) {
      updateNewsMutation.mutate({
        newsId: selectedNewsId,
        title: title.trim(),
        content: content.trim()
      })
    } else {
      addNewsMutation.mutate({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id
      })
    }
  }

  const handleDeleteNews = () => {
    if (!selectedNewsId) return
    deleteNewsMutation.mutate(selectedNewsId)
  }

  if (isLoading) {
    return <div className="loading">Ładowanie newsów...</div>
  }

  return (
    <div className="admin-news-manager">
      <h3>Zarządzanie newsami</h3>

      <div className="news-manager-tabs">
        <button
          className={`manager-tab ${mode === 'add' ? 'active' : ''}`}
          onClick={() => {
            setMode('add')
            setSelectedNewsId('')
            setError(null)
            setSuccess(null)
            setShowDeleteConfirm(false)
            // Wyczyść formularz
            setTitle('')
            setContent('')
          }}
        >
          Dodaj news
        </button>
        <button
          className={`manager-tab ${mode === 'edit' ? 'active' : ''}`}
          onClick={() => {
            setMode('edit')
            setError(null)
            setSuccess(null)
            setShowDeleteConfirm(false)
            if (selectedNewsId) {
              handleNewsSelect(selectedNewsId)
            }
          }}
        >
          Edytuj
        </button>
      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success">
          {success}
        </div>
      )}

      {mode === 'edit' && (
        <div className="news-selector">
          <label htmlFor="news-select">Wybierz news do edycji:</label>
          <select
            id="news-select"
            value={selectedNewsId}
            onChange={(e) => handleNewsSelect(e.target.value)}
            className="news-select"
          >
            <option value="">-- Wybierz news --</option>
            {news?.map(newsItem => (
              <option key={newsItem.id} value={newsItem.id}>
                {newsItem.title} - {new Date(newsItem.created_at).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'add' ? (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="newsTitle">Tytuł *</label>
            <input
              id="newsTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wprowadź tytuł newsa"
              required
              disabled={addNewsMutation.isPending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newsContent">Treść *</label>
            <textarea
              id="newsContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Wprowadź treść newsa"
              rows={10}
              required
              disabled={addNewsMutation.isPending}
            />
          </div>

          <button 
            type="submit" 
            className="admin-button"
            disabled={addNewsMutation.isPending}
          >
            {addNewsMutation.isPending ? 'Dodawanie...' : 'Dodaj news'}
          </button>
        </form>
      ) : (
        <>
          {!selectedNewsId ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>Wybierz news z listy powyżej, aby go edytować lub usunąć.</p>
            </div>
          ) : selectedNews ? (
            <>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label htmlFor="edit-newsTitle">Tytuł *</label>
                  <input
                    id="edit-newsTitle"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Wprowadź tytuł newsa"
                    required
                    disabled={updateNewsMutation.isPending || deleteNewsMutation.isPending}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-newsContent">Treść *</label>
                  <textarea
                    id="edit-newsContent"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Wprowadź treść newsa"
                    rows={10}
                    required
                    disabled={updateNewsMutation.isPending || deleteNewsMutation.isPending}
                  />
                </div>

                <button 
                  type="submit" 
                  className="admin-button"
                  disabled={updateNewsMutation.isPending || deleteNewsMutation.isPending}
                >
                  {updateNewsMutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </form>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="admin-button delete-button"
                  disabled={updateNewsMutation.isPending || deleteNewsMutation.isPending}
                  style={{ 
                    marginTop: '1rem',
                    background: 'rgba(231, 76, 60, 0.2)',
                    border: '1px solid rgba(231, 76, 60, 0.4)',
                    color: '#ff6b6b'
                  }}
                >
                  Usuń news
                </button>
              ) : (
                <div className="delete-confirm" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '8px' }}>
                  <p style={{ color: '#fff', marginBottom: '1rem' }}>
                    Czy na pewno chcesz usunąć news "{selectedNews.title}"?
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handleDeleteNews}
                      disabled={deleteNewsMutation.isPending}
                      className="admin-button"
                      style={{ 
                        background: 'rgba(231, 76, 60, 0.3)',
                        border: '1px solid rgba(231, 76, 60, 0.5)',
                        color: '#ff6b6b'
                      }}
                    >
                      {deleteNewsMutation.isPending ? 'Usuwanie...' : 'Tak, usuń'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteNewsMutation.isPending}
                      className="admin-button"
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>News nie został znaleziony.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

