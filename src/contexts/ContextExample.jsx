import React, {useState, useReducer, useEffect } from "react"
import axios from 'axios'
import { analytics } from "firebase"
import moment from 'moment'

const initialState = {
  user:{},
  userMetadata:{},
  authenticated: false,
  token:null,
  error:{message:null, code:null},
  errorState:false,
  errorMessage:'',
  state:'idle',
  loading:true,
  claims:{},
  resetPasswordSuccess: false,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'initializeState': return initialState
    case 'auth/setclaims':
      return{
        ...state,
        claims: action.payload,
      }

    case 'auth/setadmin':
      return{
        ...state,
        admin: action.payload,
      }

    case 'auth/loading':
      return{
        ...state,
        loading: action.payload,
      }
    case 'auth/changed':
      return{
        ...state,
        ...action.payload,
      }
    case 'login/init':
      return {...initialState}

    case 'metadata/update':
      return {
        ...state,
        userMetadata:action.payload
      };
  
    case 'auth/settoken':
      return {...state, token: action.payload};
  
    case 'login/success':
      return {
        ...state,
        token: action.payload.token,
        state: 'idle',
        error:{message:null, code:null},
      };
    case 'login/failed':
      return {
        ...state,
        state: 'idle',
        errorState: true,
        errorMessage: action.payload.message,
        loading: false,
      };
    case 'auth/clearerror':
      return {
        ...state,
        errorState: false,
        errorMessage: '',
        loading: false,
        error:{message:null, code:null},
        resetPasswordSuccess: false,
      }
    case 'auth/resetpwdsuccess':
      return {
        ...state,
        resetPasswordSuccess: true,
      }
    default:
      return state;
  }
}

const AuthContext = React.createContext()

const AuthProvider = (props) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);  
  const [firebase, setFirebase] = useState(props.value.firebase)
  const [analytics, setAnalytics] = useState(props.value.analytics)
  const [user, setUser] = useState()

  useEffect( ()=> {
    // login
    firebase.auth().onAuthStateChanged(handleToken )
    // automatic token refresh
    firebase.auth().onIdTokenChanged( handleToken )
  }, [])


  const handleToken =(user) => {
    if (user) {
      firebase.auth().currentUser.getIdTokenResult()
      .then(idToken => {
        if( idToken.claims.admin === true){
          console.log('idToken.token', idToken.token)
        }
        dispatch({type:'auth/setclaims', payload: idToken.claims})
        dispatch({type:'auth/settoken', payload: idToken.token})
        dispatch({type:'auth/setadmin', payload:idToken.claims.admin})
        dispatch({type:'auth/loading', payload:false})
      })

      setUser(user)
      analytics.signIn(user)
      dispatch({type:'auth/loading', payload:false})
      dispatch({type:'auth/changed', payload:{user:user, authenticated:true}})
    }
    else{
      analytics.signOut()
      dispatch({type:'auth/changed', payload:{user:{}, authenticated:false, token:null}})
      dispatch({type:'metadata/update', payload:{}})  
      
      dispatch({type:'auth/settoken', payload: false})
      firebase.auth().signOut()
      dispatch({type:'initializeState', payload:{}})
      dispatch({type:'auth/loading', payload:false})
    }
  }

  const recheckToken = () => {
    if(firebase.auth().currentUser){
      firebase.auth().currentUser.getIdTokenResult()
    }
  }

  const authenticateEmailPassword = (data) => {
    dispatch({type:'login/init'})
    analytics.action('login/init')

    firebase.auth().setPersistence(firebase.fb.auth.Auth.Persistence.SESSION)
      .then(() => {

      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      firebase.authenticateWithEmailPassword(data.email, data.password)
      .then(res=>{})
      .catch((err) => {
        analytics.action('login/failed')
        dispatch({type:'login/failed', payload:{message:'Email or Password invalid', code:err.code}} )
    })
  })
  .catch((err) => {
    console.error(err)
    analytics.action('login/failed')
    dispatch({type:'login/failed', payload:{message:'Email or Password invalid', code:err.code}} )

  })
}
  
  const registerNewUser = (data) => {
    analytics.action('register/init')
    dispatch({type:'register/init'})
    return firebase.registerNewUser(data)
  }

  const signout = () =>{
    firebase.auth().signOut()
    .catch(err=>{
      console.errer(err)
    })
  }
  const resetPassword = (email) => {
    return firebase.auth().sendPasswordResetEmail(email)
    .then(res => dispatch({type:'auth/resetpwdsuccess'}))
    .catch(err => {
      dispatch({type:'login/failed', payload:err} )
    })
  }

  const customFirebasePasswordAuth = (queryParams, password, next) => {
    firebase.auth().confirmPasswordReset(queryParams.oobCode, password)
    .then(res => {
      next()
    })
    .catch((err) => {
      console.error(err)
      dispatch({type:'login/failed', payload:err} )
    })
  }

  const clearError = () => {
    dispatch({type:'auth/clearerror'})
  }

  return (
    <AuthContext.Provider value={ 
      {
        ...state,
        login: {action:authenticateEmailPassword},
        register: {action:registerNewUser},
        logout: signout,
        resetPassword,
        customFirebasePasswordAuth,
        recheckToken,
        clearError,
        dispatch,
      } }
    >
      {props.children}
    </AuthContext.Provider>
  )

}

export {AuthContext}
export const AuthConsumer  = AuthContext.Consumer
export default AuthProvider
