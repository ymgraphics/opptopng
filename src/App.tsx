import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Globe } from 'lucide-react';
import OpportunityViewer from './components/OpportunityViewer';

const httpLink = createHttpLink({
  uri: 'https://gis-api.aiesec.org/graphql',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: '797149ff3e2ee6a8abc4f101a77c714caf9463dcb69be8bd5d53e0698064aa91',
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AIESEC Opportunity Viewer</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <OpportunityViewer />
        </main>

        <footer className="bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-center text-gray-500">
              Powered by AIESEC GIS API
            </p>
          </div>
        </footer>
      </div>
    </ApolloProvider>
  );
}

export default App;