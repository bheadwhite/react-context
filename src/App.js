import { useReducer, createContext, useContext } from 'react';
import './App.css';

// react context
// https://reactjs.org/docs/context.html
// think of it as another solution to solving the prop drilling problem
// if you have state you want to send around your app and you want another tool similar to redux
// react context can shine

//provider - this is a function that will manage your state,
// and give access of that state to all children/grandchildren jsx elements underneath it

//lets make a provider that tracks user state
const initialUserState = {
  isLoggedIn: false,
  username: '',
  email: '',
};

function userReducer(state, action) {
  switch (action.type) {
    case 'SET_LOGGEDIN':
      return { ...state, isLoggedIn: action.payload };
    case 'SET_USERNAME':
      return { ...state, username: action.payload };
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    default:
      return state;
  }
}

// to create a context provider we need to create a context
export const UserContext = createContext();
// to tie into that context (in a grandchild/child element under the provider somewhere)
// we can create a useContext hook that will connect to that context/state
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context == null) {
    throw new Error('userContext needs to be within a Provider');
  }
  return context;
};

// here is our provider function that will wrap all of our components that want to subscribe to this initialUserState
const UserProvider = ({ children }) => {
  // we're using a useReducer hook instead of useState because a reducer can manage objects with more performance
  //
  //    ```useReducer is usually preferable to useState when you have complex state logic
  //    that involves multiple sub-values or when the next state depends on the previous
  //    one. useReducer also lets you optimize performance for components that trigger deep
  //    updates because you can pass dispatch down instead of callbacks.```
  //
  //                            -- https://reactjs.org/docs/hooks-reference.html#usereducer
  //
  const [userState, setUserState] = useReducer(userReducer, initialUserState);
  const providerValue = { userState, setUserState };

  return (
    <UserContext.Provider value={providerValue}>
      {children}
    </UserContext.Provider>
  );
};

function App() {
  return (
    <div className='App'>
      <UserProvider>
        <UserProfile />
        <IsUserLoggedIn />
      </UserProvider>
    </div>
  );
}

//lets create a component that wants to subscribe to the context
function UserProfile() {
  const { userState } = useUserContext();

  return (
    <div>
      <div>{JSON.stringify(userState, undefined, 2)}</div>
      <ManageUser />
    </div>
  );
}

//lets create a component that will manage that user
function ManageUser() {
  const { userState, setUserState } = useUserContext();

  const handleInputChange = (e) => {
    setUserState({ type: `SET_${e.target.name}`, payload: e.target.value });
  };

  const handleLoggedIn = (e) => {
    setUserState({ type: 'SET_LOGGEDIN', payload: !userState.isLoggedIn });
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'grid', gridGap: '8px', width: '200px' }}>
        <input
          type='text'
          name='USERNAME'
          placeholder='Name'
          onChange={handleInputChange}
        />
        <input
          type='text'
          name='EMAIL'
          placeholder='Email'
          onChange={handleInputChange}
        />
        <button onClick={handleLoggedIn}>
          {userState.isLoggedIn ? 'Log Out' : 'Log In'}
        </button>
      </div>
    </div>
  );
}

//for kicks one more component that will subscribe to that state
const IsUserLoggedIn = () => {
  const { userState } = useUserContext();

  if (!userState.isLoggedIn) {
    return null;
  }

  return (
    <span style={{ position: 'absolute', top: 0, right: 0 }}>WELCOME!!</span>
  );
};

export default App;
