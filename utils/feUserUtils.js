import { PERM_TOO_MANY_PRODUCTS, PERM_PRODUCT_GALLERY } from "./consts"

export function userHasPermissions(data, permission) {
  if(permission == PERM_PRODUCT_GALLERY) {
    let plan = data.user.plan.split("_")[0]
    console.log("User's plan: ", plan)
    return plan == 'photographer' || plan == 'designer'
  }

  if(permission == PERM_TOO_MANY_PRODUCTS) {
    let plan = data.user.plan.split("_")[0]
    if(plan == 'designer') {
        if(data.products.length >= 2) {
            return false;
        }
        return true;
    }
    return (plan == 'photographer')
  }
}
