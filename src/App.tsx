import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import TableEditor from './components/TableEditor';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="app-container">
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Variable Table Editor</h1>
        <TableEditor />
      </div>
    </ConfigProvider>
  );
}

export default App;
