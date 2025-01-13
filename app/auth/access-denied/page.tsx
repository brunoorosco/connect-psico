import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className='text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-xl max-w-md w-full mx-4'>
        <h1 className='text-4xl font-bold text-red-600 dark:text-red-500 mb-4'>
          Acesso Negado
        </h1>
        <div className='mb-6'>
          <svg
            className='mx-auto h-16 w-16 text-red-600 dark:text-red-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        <p className='text-gray-600 dark:text-gray-300 mb-6'>
          Você não tem permissão para acessar esta página.
        </p>
        <Link
          href='/'
          className='inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200'
        >
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}
