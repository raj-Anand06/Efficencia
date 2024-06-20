import { useEffect, useCallback } from 'react';
import $ from 'jquery';

const setCookie = (cname, cvalue, exdays) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
};

const getCookie = (cname) => {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

const useCodeforcesUser = (setPlaceholderUserID, fetchSolvedProblems) => {
  const validateUsername = useCallback((username) => {
    const url = `https://codeforces.com/api/user.info?handles=${username}`;
    const timer = setTimeout(() => {
      username = prompt("Some error while setting username, please re-enter");
      validateUsername(username);
    }, 5000);
    $.getJSON(url, (data) => {
      clearInterval(timer);
      setCookie("cf_username", username, 1);
      setPlaceholderUserID(username);
      fetchSolvedProblems(username);
    });
  }, [setPlaceholderUserID, fetchSolvedProblems]);

  useEffect(() => {
    const username = getCookie("cf_username");
    if (!username) {
      const newUsername = prompt("No username is set. Enter your Codeforces username");
      validateUsername(newUsername);
    } else {
      setPlaceholderUserID(username);
      fetchSolvedProblems(username);
    }
  }, [setPlaceholderUserID, fetchSolvedProblems, validateUsername]);

  const changeUser = useCallback(() => {
    const newUsername = prompt("Enter your new Codeforces username");
    validateUsername(newUsername);
  }, [validateUsername]);

  return changeUser;
};

export default useCodeforcesUser;
