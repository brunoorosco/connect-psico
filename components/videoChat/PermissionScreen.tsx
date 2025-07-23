interface Props {
  onAllow: () => void;
}

export default function PermissionScreen({ onAllow }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-6 px-4 text-center">
      <h1 className="text-2xl font-semibold">Permitir acesso à câmera e microfone</h1>
      <p className="text-sm max-w-md">
        Precisamos da sua permissão para acessar a câmera e o microfone. Isso é necessário para iniciar a chamada.
      </p>
      <button
        onClick={onAllow}
        className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full shadow text-white font-medium"
      >
        Permitir Acesso
      </button>
    </div>
  );
}
