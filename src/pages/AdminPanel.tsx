import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import AdminMatchManager from '../components/AdminMatchManager'
import AdminMatchStats from '../components/AdminMatchStats'
import AdminAddPlayers from '../components/AdminAddPlayers'
import AdminEventsManager from '../components/AdminEventsManager'
import './admin.css'

export default function AdminPanel() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Debug - sprawdź wartości
  useEffect(() => {
    console.log('AdminPanel - user:', user?.id, 'profile:', profile?.role, 'loading:', loading)
  }, [user, profile, loading])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Sprawdź czy użytkownik jest administratorem
  useEffect(() => {
    // Czekaj aż loading się skończy
    if (!loading) {
      // Jeśli nie ma użytkownika, przekieruj
      if (!user) {
        navigate('/')
        return
      }
      
      // Jeśli profile jest załadowane i użytkownik nie jest adminem, przekieruj
      if (profile !== null && profile?.role !== 'admin') {
        navigate('/')
      }
    }
  }, [user, profile, loading, navigate])

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
      setSuccess('News został dodany pomyślnie!')
      setTitle('')
      setContent('')
      setError(null)
      // Odśwież listę newsów
      queryClient.invalidateQueries({ queryKey: ['news'] })
      // Wyczyść komunikat sukcesu po 3 sekundach
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (error: Error) => {
      setError(error.message || 'Wystąpił błąd przy dodawaniu newsa')
      setSuccess(null)
    }
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim()) {
      setError('Tytuł jest wymagany')
      return
    }

    if (!content.trim()) {
      setError('Treść jest wymagana')
      return
    }

    if (!user) {
      setError('Musisz być zalogowany')
      return
    }

    addNewsMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      author_id: user.id
    })
  }

  // Pokazuj loading dopóki się ładuje lub dopóki profile się nie załaduje
  if (loading || (user && profile === null)) {
    return (
      <div className="page admin">
        <div className="loading">Ładowanie...</div>
      </div>
    )
  }

  // Jeśli nie ma użytkownika lub nie jest adminem, nie pokazuj nic (useEffect przekieruje)
  if (!user || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="page admin">
      <div className="admin-header">
        <h1>Panel Administratora</h1>
        <p>Zarządzaj treścią aplikacji</p>
      </div>

      <div className="admin-content">
        <section className="admin-section">
          <h2>Dodaj nowy news</h2>
          
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

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="title">Tytuł *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Wprowadź tytuł newsa"
                disabled={addNewsMutation.isPending}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Treść *</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Wprowadź treść newsa"
                rows={10}
                disabled={addNewsMutation.isPending}
                required
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
        </section>

        <section className="admin-section">
          <AdminEventsManager />
        </section>

        <section className="admin-section">
          <AdminMatchManager />
        </section>

        <section className="admin-section">
          <AdminMatchStats currentUserId={user.id} />
        </section>

        <section className="admin-section">
          <AdminAddPlayers />
        </section>
      </div>
    </div>
  )
}

