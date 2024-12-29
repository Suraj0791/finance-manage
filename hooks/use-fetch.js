//for the form submission , suppose crrate accout we need to manage api call 
//so we made this file 
//this hookis kind of general method for any api call , basically laoding , error , fetching , returning data , settingr espone nd all
//usefetch will accept argument a fucntion so we used cb 


import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
   //before fetching our api we set loading to true and set error to null 
    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;