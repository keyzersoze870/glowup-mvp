// RevenueCat integration for Cortilow
// Products configured in App Store Connect
export const PRODUCT_IDS = {
  weekly: 'cortilow_weekly_399',
  monthly: 'cortilow_monthly_999', 
  yearly: 'cortilow_yearly_3999',
}

export const REVENUECAT_API_KEY = 'appl_LVEiaCMDIFZEBkPgbQZfgUMGNOp' // Replace after RevenueCat setup

let rcInitialized = false

export async function initPurchases() {
  if (rcInitialized) return
  if (typeof window === 'undefined') return
  
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY })
    rcInitialized = true
    console.log('RevenueCat initialized')
  } catch (err) {
    console.error('RevenueCat init error:', err)
  }
}

export async function getOfferings() {
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const offerings = await Purchases.getOfferings()
    return offerings.current
  } catch (err) {
    console.error('Get offerings error:', err)
    return null
  }
}

export async function purchasePackage(productId: string) {
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const offerings = await Purchases.getOfferings()
    
    if (!offerings.current) throw new Error('No offerings available')
    
    const pkg = offerings.current.availablePackages.find(
      (p: any) => p.product.identifier === productId
    )
    
    if (!pkg) throw new Error(`Package not found: ${productId}`)
    
    const result = await Purchases.purchasePackage({ aPackage: pkg })
    
    // Check if the purchase was successful
    if (result.customerInfo.entitlements.active['Cortilow Pro']) {
      localStorage.setItem('cortilow_premium', 'true')
      return { success: true }
    }
    
    return { success: false }
  } catch (err: any) {
    if (err.code === 1 || err.message?.includes('cancelled')) {
      return { success: false, cancelled: true }
    }
    console.error('Purchase error:', err)
    return { success: false, error: err.message }
  }
}

export async function checkPremium() {
  // Quick local check first
  if (localStorage.getItem('cortilow_premium') === 'true') return true
  
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const info = await Purchases.getCustomerInfo()
const isPremium = !!info.customerInfo.entitlements.active['Cortilow Pro']
    if (isPremium) localStorage.setItem('cortilow_premium', 'true')
    return isPremium
  } catch {
    return localStorage.getItem('cortilow_premium') === 'true'
  }
}

export async function restorePurchases() {
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const info = await Purchases.restorePurchases()
    const isPremium = !!info.customerInfo.entitlements.active['Cortilow Pro']
    if (isPremium) localStorage.setItem('cortilow_premium', 'true')
    return isPremium
  } catch (err) {
    console.error('Restore error:', err)
    return false
  }
}

