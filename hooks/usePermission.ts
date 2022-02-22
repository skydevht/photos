import { useEffect, useState } from "react";
import { storagePermission } from "../utils/permissions";

export default function usePermission() {
    const [permission, setPermission] = useState<boolean>(false);
    useEffect(() => {
        console.log(['Checking for permissions']);
        storagePermission()
            .then((res) => setPermission(res))
            .catch((error) => { });
    }, []);
    return permission;
}