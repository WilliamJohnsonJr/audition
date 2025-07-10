import { useAuth0 } from '@auth0/auth0-react';
import { jwtDecode } from "jwt-decode";
import { useCallback, useRef, useState } from 'react';

const checkPermission = async (requiredPermission: string) => {
  const { userPermissions } = usePermissions();
  try {
    if (userPermissions.includes(requiredPermission)) {
      console.log(`User has permission: ${requiredPermission}`);
      return true;
      // Render content or allow action
    } else {
      console.log(`User does NOT have permission: ${requiredPermission}`);
      return false;
      // Render alternative content or restrict action
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};


const usePermissions = () => {
    const { isLoading, getAccessTokenSilently } = useAuth0();
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const isLoadingRef = useRef(false);
    const refresh = useCallback(async () => {
      if (isLoadingRef.current) {
        return;
      } else {
        try {
          const accessToken = await getAccessTokenSilently();
          const decodedToken = jwtDecode(accessToken);
          setUserPermissions(decodedToken.permissions || []);
        } catch (e) {
          console.error(e)
        } finally {
          isLoadingRef.current = false;
        }
      }
    }, [isLoading]);

    return { userPermissions, refresh,}
  }