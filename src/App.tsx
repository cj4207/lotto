import { useState } from 'react'
import { useLotto } from './hooks/useLotto'
import { Generator } from './components/generator/Generator'
import { Statistics } from './components/statistics/Statistics'
import { Tab } from './types'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')
  const { sets, generateNumbers } = useLotto()

  return (
    <div className="lotto-container">
      <h1>🎰 로또 연구소</h1>

      <div className="tabs">
        <button 
          className={activeTab === 'generate' ? 'active' : ''} 
          onClick={() => setActiveTab('generate')}
        >
          번호 생성
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          출현 통계
        </button>
      </div>
      
      {activeTab === 'generate' ? (
        <Generator 
          sets={sets} 
          onGenerate={generateNumbers} 
        />
      ) : (
        <Statistics />
      )}
    </div>
  )
}

export default App
