import { createContext, useState } from "react";

const ModalContext = createContext();

export default ModalContext;

export const ModalProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState("");

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openSearch = (query = "") => {
    setSearchInitialQuery(query);
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchInitialQuery("");
  };

  const contextData = {
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    isSearchOpen,
    openSearch,
    closeSearch,
    searchInitialQuery,
    setSearchInitialQuery,
  };

  return (
    <ModalContext.Provider value={contextData}>
      {children}
    </ModalContext.Provider>
  );
};
