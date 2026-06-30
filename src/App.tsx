import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import TableEditor from './components/TableEditor';
import './App.less';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="app-container">
        <TableEditor />
      </div>
    </ConfigProvider>
  );
}

export default App;
