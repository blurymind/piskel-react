import * as React from 'react';

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };

    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log(
      {error,
      stack: info,
      compStack: React.captureOwnerStack(),
    }
    );
    this.props.onError?.({error, info})
    this.setState({errorInfo: {error, info}})
  }

    resetErrorBoundary() {
       this.setState({ hasError: false, errorInfo: null });
     }

  render() {
    if (this.state.hasError) {
      return <div>
        {this.props.fallback}
        <div>{this.state.errorInfo?.error?.message}</div>
        <div>{this.state.errorInfo?.error?.code}</div>
        <div>{this.state.errorInfo?.error?.reasonCode}</div>
        <div>line:{this.state.errorInfo?.error?.loc?.line}</div>
        </div>;
    }

    return this.props.children;
  }
}
export default ErrorBoundary