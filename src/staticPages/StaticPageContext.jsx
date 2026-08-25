import { createContext, useContext } from 'react'

const StaticPageContext = createContext(null)

export const StaticPageProvider = ({ value, children }) => (
	<StaticPageContext.Provider value={value}>
		{children}
	</StaticPageContext.Provider>
)

export const useStaticPageKey = () => useContext(StaticPageContext)
