
import React, { useState, useCallback } from 'react';

type Status = 'disconnected' | 'connecting' | 'connected' | 'error';

// --- Icon Components ---
const CameraIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
    </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

// --- UI Components ---
interface IpInputFormProps {
    ipAddress: string;
    setIpAddress: (ip: string) => void;
    streamPath: string;
    setStreamPath: (path: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onDisconnect: () => void;
    status: Status;
}

const IpInputForm: React.FC<IpInputFormProps> = ({ ipAddress, setIpAddress, streamPath, setStreamPath, onSubmit, onDisconnect, status }) => {
    const isConnecting = status === 'connecting';
    const isConnected = status === 'connected';
    
    return (
        <form onSubmit={onSubmit} className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="ipAddress" className="block text-sm font-medium text-slate-400 mb-1">IP-адрес</label>
                    <input
                        type="text"
                        id="ipAddress"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        disabled={isConnecting || isConnected}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 transition"
                        placeholder="например, 10.1.85.45"
                    />
                </div>
                <div>
                    <label htmlFor="streamPath" className="block text-sm font-medium text-slate-400 mb-1">Путь к потоку</label>
                    <input
                        type="text"
                        id="streamPath"
                        value={streamPath}
                        onChange={(e) => setStreamPath(e.target.value)}
                        disabled={isConnecting || isConnected}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 transition"
                        placeholder="например, /video.mjpg"
                    />
                </div>
            </div>
            
            {isConnected ? (
                <button
                    type="button"
                    onClick={onDisconnect}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 transition"
                >
                    Отключиться
                </button>
            ) : (
                <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-900 disabled:bg-sky-800 disabled:cursor-not-allowed transition"
                >
                    {isConnecting && <div className="spinner w-4 h-4 border-2 rounded-full mr-2"></div>}
                    {isConnecting ? 'Подключение...' : 'Подключиться'}
                </button>
            )}
        </form>
    );
};

interface VideoDisplayProps {
    streamUrl: string | null;
    status: Status;
    errorMessage: string | null;
    onLoad: () => void;
    onError: () => void;
    onOpenInNewWindow: () => void;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ streamUrl, status, errorMessage, onLoad, onError, onOpenInNewWindow }) => {
    const renderContent = () => {
        switch (status) {
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                        <AlertTriangleIcon className="w-16 h-16 mb-4" />
                        <h3 className="text-lg font-semibold">Ошибка подключения</h3>
                        <p className="text-sm text-slate-400">{errorMessage}</p>
                    </div>
                );
            case 'connecting':
                 return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="spinner w-16 h-16 border-4 rounded-full mb-4"></div>
                        <p className="text-slate-400">Загрузка видеопотока...</p>
                    </div>
                );
            case 'connected':
                return (
                    <div className="relative w-full h-full">
                        <img
                            src={streamUrl!}
                            onLoad={onLoad}
                            onError={onError}
                            alt="Прямая трансляция с IP-камеры"
                            className="w-full h-full object-contain"
                        />
                         <button
                            onClick={onOpenInNewWindow}
                            className="absolute top-2 right-2 bg-slate-800 bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition-opacity duration-300"
                            title="Открыть в новом окне"
                        >
                            <ExternalLinkIcon className="w-5 h-5" />
                        </button>
                    </div>
                );
            case 'disconnected':
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <CameraIcon className="w-24 h-24 mb-4" />
                        <h3 className="text-lg font-semibold">Нет подключения</h3>
                        <p className="text-sm">Введите IP-адрес камеры и путь к потоку для подключения.</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full aspect-video bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center overflow-hidden transition-colors">
            {renderContent()}
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [ipAddress, setIpAddress] = useState('10.1.85.45');
    const [streamPath, setStreamPath] = useState('/video.mjpg');
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>('disconnected');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleConnect = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!ipAddress) {
            setStatus('error');
            setErrorMessage("IP-адрес не может быть пустым.");
            return;
        }
        setStatus('connecting');
        setErrorMessage(null);
        // We assume an HTTP protocol. For local networks, this is common.
        setStreamUrl(`http://${ipAddress.trim()}${streamPath.trim()}`);
    }, [ipAddress, streamPath]);

    const handleDisconnect = useCallback(() => {
        setStreamUrl(null);
        setStatus('disconnected');
    }, []);

    const handleLoadSuccess = useCallback(() => {
        if (status === 'connecting') {
           setStatus('connected');
        }
    }, [status]);
    
    const handleError = useCallback(() => {
        setStatus('error');
        setErrorMessage("Не удалось загрузить поток. Проверьте IP-адрес, путь к потоку и убедитесь, что вы находитесь в одной локальной сети с камерой.");
        setStreamUrl(null);
    }, []);

    const handleOpenInNewWindow = useCallback(() => {
        if (streamUrl) {
            window.open(streamUrl, '_blank', 'noopener,noreferrer');
        }
    }, [streamUrl]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <main className="w-full max-w-4xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-6 md:p-8 space-y-6">
                    <header className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-sky-400">Просмотр IP-камеры</h1>
                        <p className="text-slate-400 mt-1">Подключитесь к видеопотоку в вашей локальной сети.</p>
                    </header>
                    
                    <VideoDisplay
                        streamUrl={streamUrl}
                        status={status}
                        errorMessage={errorMessage}
                        onLoad={handleLoadSuccess}
                        onError={handleError}
                        onOpenInNewWindow={handleOpenInNewWindow}
                    />

                    <IpInputForm
                        ipAddress={ipAddress}
                        setIpAddress={setIpAddress}
                        streamPath={streamPath}
                        setStreamPath={setStreamPath}
                        onSubmit={handleConnect}
                        onDisconnect={handleDisconnect}
                        status={status}
                    />
                </div>
                <footer className="text-center mt-8 text-sm text-slate-500">
                    <p>Следующие шаги: трекинг людей и распознавание лиц.</p>
                </footer>
            </main>
        </div>
    );
}
