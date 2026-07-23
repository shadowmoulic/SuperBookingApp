import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export function usePermission() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } = useContext(AuthContext);
  return { hasPermission, hasAnyPermission, hasAllPermissions, permissions };
}

export function useProvider() {
  const { memberships } = useContext(AuthContext);
  return memberships?.provider || [];
}

export function useEnterprise() {
  const { memberships } = useContext(AuthContext);
  return memberships?.enterprise || [];
}
