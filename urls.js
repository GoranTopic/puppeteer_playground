const consulta_principal_url = "https://appscvsmovil.supercias.gob.ec/PortalInfor/consultaPrincipal.zul?id=1"

const home_page_url = 'https://www.supercias.gob.ec/portalscvs/'

const company_page = 'https://appscvs1.supercias.gob.ec/portalCia/contenedor.zul?param='

const company_documents_page = 'https://appscvsmovil.supercias.gob.ec/portaldedocumentos/consulta_cia_menu.zul'

const isAtHomePage = page => 
		page.url() === home_page_url

const isAtConsultaPrincipal = page => 
		page.url() === consulta_principal_url

const isAtCompanyPage = page => // <=== neeed testing
		page.url().match(`/${company_page}.*/`)

const isAtCompanyDocumentsPage = page =>{
		console.log("debug condition:")
		//console.log(page)
		console.log(page.url())
		return page.url().match(`/${company_documents_page}.*/`)
}

export { isAtCompanyDocumentsPage, isAtConsultaPrincipal, isAtHomePage, isAtCompanyPage, consulta_principal_url, home_page_url }
