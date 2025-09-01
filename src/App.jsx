import React, { useEffect, useState } from 'react'
import { supabase } from './client'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // check current session on load
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user ?? null)
    }
    getSession()

    // listen to auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) fetchTodos()
    else setTodos([])
  }, [user])

  async function signUp() {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Signup: check your email if confirmation required')
    setLoading(false)
  }

  async function signIn() {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else {
      setUser(data.user)
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setTodos(data)
  }

  async function addTodo() {
    if (!newTitle) return
    const { data, error } = await supabase
      .from('todos')
      .insert([{ user_id: user.id, title: newTitle }])
      .select()
    if (error) alert(error.message)
    else {
      setNewTitle('')
      fetchTodos()
    }
  }

  async function toggleComplete(todo) {
    const { data, error } = await supabase
      .from('todos')
      .update({ is_complete: !todo.is_complete })
      .eq('id', todo.id)
      .select()
    if (error) console.error(error)
    else fetchTodos()
  }

  async function deleteTodo(id) {
    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select()
    if (error) console.error(error)
    else fetchTodos()
  }

  if (!user) {
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
        <h2>Task Manager — Signup / Login</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{display:'block', width:'100%', padding:8, marginTop:10}} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{display:'block', width:'100%', padding:8, marginTop:10}} />
        <div style={{ marginTop: 12 }}>
          <button onClick={signUp} disabled={loading} style={{ marginRight: 8 }}>Signup</button>
          <button onClick={signIn} disabled={loading}>Login</button>
        </div>
      </div>
    )
  }

  // logged in view
  return (
    <div style={{ padding: 24, maxWidth: 680, margin: '40px auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Your Todos</h2>
        <div>
          <span style={{marginRight:12}}>{user.email}</span>
          <button onClick={signOut}>Logout</button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="New todo title" style={{width:'70%', padding:8}} />
        <button onClick={addTodo} style={{marginLeft:8}}>Add</button>
      </div>

      <ul style={{ marginTop: 20, listStyle:'none', padding:0 }}>
        {todos.map(t => (
          <li key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:10, border:'1px solid #eee', borderRadius:6, marginBottom:8 }}>
            <div>
              <input type="checkbox" checked={t.is_complete} onChange={() => toggleComplete(t)} />
              <span style={{ marginLeft: 10, textDecoration: t.is_complete ? 'line-through' : 'none' }}>{t.title}</span>
            </div>
            <div>
              <button onClick={() => deleteTodo(t.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
