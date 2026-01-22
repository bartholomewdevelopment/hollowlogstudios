import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { checkTableHasData } from '@/firebase/dataFetcher';

interface DataStatusProps {
  onRefresh?: () => void;
}

const DataLoadingStatus: React.FC<DataStatusProps> = ({ onRefresh }) => {
  const [dataStatus, setDataStatus] = useState({
    paintings: false,
    books: false,
    murals: false,
    artist_profile: false,
    isChecking: true,
    error: null as string | null
  });

  const checkAllData = async () => {
    try {
      setDataStatus(prev => ({ ...prev, isChecking: true, error: null }));
      
      const [hasPaintings, hasBooks, hasMurals, hasArtistProfile] = await Promise.all([
        checkTableHasData('paintings'),
        checkTableHasData('books'),
        checkTableHasData('murals'),
        checkTableHasData('artist_profile')
      ]);

      setDataStatus({
        paintings: hasPaintings,
        books: hasBooks,
        murals: hasMurals,
        artist_profile: hasArtistProfile,
        isChecking: false,
        error: null
      });
    } catch (error) {
      console.error('Error checking data status:', error);
      setDataStatus(prev => ({
        ...prev,
        isChecking: false,
        error: 'Failed to check data status. Please try again.'
      }));
    }
  };

  useEffect(() => {
    checkAllData();
  }, []);

  const handleRefresh = () => {
    checkAllData();
    if (onRefresh) onRefresh();
  };

  const hasAnyData = dataStatus.paintings || dataStatus.books || dataStatus.murals || dataStatus.artist_profile;
  const allDataMissing = !dataStatus.isChecking && !hasAnyData && !dataStatus.error;

  if (dataStatus.isChecking) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full" 
             aria-label="loading"></div>
        <p className="mt-2">Checking data status...</p>
      </div>
    );
  }

  if (dataStatus.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{dataStatus.error}</AlertDescription>
        <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </Alert>
    );
  }

  if (allDataMissing) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Data Missing</AlertTitle>
        <AlertDescription className="text-amber-700">
          No data found in the database. All paintings, books, murals, and artist profile information are missing.
          This could be due to a database connection issue or because no content has been added yet.
        </AlertDescription>
        <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <h3 className="font-medium">Data Status:</h3>
      <ul className="space-y-2">
        <li className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${dataStatus.paintings ? 'bg-green-500' : 'bg-red-500'}`}></span>
          Paintings: {dataStatus.paintings ? 'Available' : 'Missing'}
        </li>
        <li className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${dataStatus.books ? 'bg-green-500' : 'bg-red-500'}`}></span>
          Books: {dataStatus.books ? 'Available' : 'Missing'}
        </li>
        <li className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${dataStatus.murals ? 'bg-green-500' : 'bg-red-500'}`}></span>
          Murals: {dataStatus.murals ? 'Available' : 'Missing'}
        </li>
        <li className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${dataStatus.artist_profile ? 'bg-green-500' : 'bg-red-500'}`}></span>
          Artist Profile: {dataStatus.artist_profile ? 'Available' : 'Missing'}
        </li>
      </ul>
      <Button variant="outline" size="sm" onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
      </Button>
    </div>
  );
};

export default DataLoadingStatus;