import { useEffect, useState } from 'react';
import axiosClient from 'axios';

const useQuery = (url) => {
  const [state, setState] = useState({
    data: null,
    isLoading: true,
    error: '',
  });

  useEffect(() => {
    const fetch = async () => {
      axiosClient
        .get(url)
        .then(({ data }) => setState({ data, isLoading: false, error: '' }))
        .catch(error =>
          setState({ data: null, isLoading: false, error: error.message })
        );
    };

    fetch();
  }, [url]);

  return state;
};

export default useQuery;