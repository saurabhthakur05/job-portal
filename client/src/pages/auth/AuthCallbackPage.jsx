import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken } from '../../store/store';
import { fetchUser } from '../../store/store';
import { PageLoader } from '../../components/ui/Spinner';

const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      dispatch(setToken(token));
      dispatch(fetchUser()).then(() => navigate('/dashboard'));
    } else {
      navigate('/login');
    }
  }, [params, dispatch, navigate]);

  return <PageLoader />;
};

export default AuthCallbackPage;
