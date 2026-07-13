import {useAppData} from  '../context/AppContext';
import { Navigate , Outlet, useLocation } from 'react-router-dom';


const ProtectedRoute = () => {
    const { isAuth, loading , user } = useAppData();
    const location=useLocation(); 
    if(loading) return null;
    if(!isAuth) return <Navigate to={"/login"} replace />;
    if(user?.role === null && location.pathname !=="/select-role") return <Navigate to={"/select-role"} replace />;
    if(user?.role !==null && location.pathname ==="/select-role") return <Navigate to={"/"} replace />;
    return <Outlet />;
}

export default ProtectedRoute;