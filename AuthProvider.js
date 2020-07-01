import React, {
    useState, useMemo, useEffect, createContext, useContext,
} from 'react';
import Cookies from 'js-cookie';

import {APP_COOKIES_PREFIX} from '../variables';

import * as auth from  '../services/AuthService'

const AuthContextData = {
    authenticated: null,
    user: {},
    login: async function() {}
}

const AuthContext = createContext(AuthContextData);

function AuthProvider({children}) {
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)

    useEffect(() => {
        loadCookies()
    }, [token, user])

    const login = async (values) => {
        const response = await auth.login(values)

        if(response.data.status === 'success') {
            setToken(response.data.access_token)
            setUser(response.data.user)
            saveCookies()
        }

        return response
    }

    const logout = async () => {
        Cookies.remove(APP_COOKIES_PREFIX + 'token')
        Cookies.remove(APP_COOKIES_PREFIX + 'user')

        return await auth.logout()
    }

    const saveCookies = () => {
        if(token && user) {
            Cookies.set(APP_COOKIES_PREFIX + 'token', token, {expires: 7})
            Cookies.set(APP_COOKIES_PREFIX + 'user', user, {expires: 7})
            setAxiosToken()
        }
    }

    const loadCookies = () => {
        const storedToken = Cookies.get(APP_COOKIES_PREFIX + 'token')
        const storedUser = Cookies.get(APP_COOKIES_PREFIX + 'user')
        if(storedToken && storedUser) {
            awaitsetUser(storedUser)
            setToken(storedToken)
            setAxiosToken()
        }
    }

    const setAxiosToken = () => {
        window.axios.defaults.headers['Authorization'] = `Baerer ${token}`;
    }

    const memo = useMemo(
        () => ({
            authenticated: !!user,
            user,
            token,
        }),
        [user, token],
    );

    return (
        <AuthContext.Provider value={{ ...memo, login, logout }}>
            { children }
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
