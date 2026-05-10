import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LifeTrack Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-sm w-full">
            <div className="text-4xl mb-3">🔧</div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">出错了</h1>
            <p className="text-sm text-gray-500 mb-4">
              应用程序遇到了意外错误。你可以尝试刷新页面或清除数据。
            </p>
            {this.state.error && (
              <div className="bg-red-50 rounded-lg p-3 mb-4 overflow-auto max-h-32">
                <pre className="text-xs text-red-700 whitespace-pre-wrap">{this.state.error.message}</pre>
              </div>
            )}
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm"
              >
                刷新页面
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm"
              >
                清除本地数据并刷新
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
