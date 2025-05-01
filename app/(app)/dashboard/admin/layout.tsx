const DashboardPageAdmin = async ({children}: {children?: React.ReactNode}) => {
  return (
    <div>
      <h1>ADMIN</h1>  
      {children}
    </div>
  );
};

export default DashboardPageAdmin;
