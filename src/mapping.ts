import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Contract,
  UpdateBeneficiary,
  UpdateFormula,
  UpdateFees,
  NewMetaBatch,
  NewBatch,
  CancelBatch,
  AddCollateralToken,
  RemoveCollateralToken,
  UpdateCollateralToken,
  Open,
  OpenBuyOrder,
  OpenSellOrder,
  ClaimBuyOrder,
  ClaimSellOrder,
  ClaimCancelledBuyOrder,
  ClaimCancelledSellOrder,
  UpdatePricing,
  ScriptResult,
  RecoverToVault
} from "../generated/Contract/Contract"
import { BuyOrder, ExampleEntity, SellOrder } from "../generated/schema"

export function handleUpdateBeneficiary(event: UpdateBeneficiary): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.beneficiary = event.params.beneficiary

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.hasInitialized(...)
  // - contract.PPM(...)
  // - contract.UPDATE_FORMULA_ROLE(...)
  // - contract.metaBatches(...)
  // - contract.getEVMScriptExecutor(...)
  // - contract.tokenManager(...)
  // - contract.OPEN_BUY_ORDER_ROLE(...)
  // - contract.UPDATE_COLLATERAL_TOKEN_ROLE(...)
  // - contract.getRecoveryVault(...)
  // - contract.beneficiary(...)
  // - contract.UPDATE_BENEFICIARY_ROLE(...)
  // - contract.isOpen(...)
  // - contract.collateralsToBeClaimed(...)
  // - contract.formula(...)
  // - contract.ADD_COLLATERAL_TOKEN_ROLE(...)
  // - contract.UPDATE_FEES_ROLE(...)
  // - contract.getBatch(...)
  // - contract.OPEN_ROLE(...)
  // - contract.sellFeePct(...)
  // - contract.getStaticPricePPM(...)
  // - contract.allowRecoverability(...)
  // - contract.appId(...)
  // - contract.getInitializationBlock(...)
  // - contract.tokensToBeMinted(...)
  // - contract.canPerform(...)
  // - contract.getEVMScriptRegistry(...)
  // - contract.REMOVE_COLLATERAL_TOKEN_ROLE(...)
  // - contract.batchBlocks(...)
  // - contract.reserve(...)
  // - contract.OPEN_SELL_ORDER_ROLE(...)
  // - contract.kernel(...)
  // - contract.isPetrified(...)
  // - contract.getCurrentBatchId(...)
  // - contract.collaterals(...)
  // - contract.getCollateralToken(...)
  // - contract.controller(...)
  // - contract.buyFeePct(...)
  // - contract.token(...)
  // - contract.PCT_BASE(...)
}

export function handleUpdateFormula(event: UpdateFormula): void {}

export function handleUpdateFees(event: UpdateFees): void {}

export function handleNewMetaBatch(event: NewMetaBatch): void {}

export function handleNewBatch(event: NewBatch): void {}

export function handleCancelBatch(event: CancelBatch): void {}

export function handleAddCollateralToken(event: AddCollateralToken): void {}

export function handleRemoveCollateralToken(
  event: RemoveCollateralToken
): void {}

export function handleUpdateCollateralToken(
  event: UpdateCollateralToken
): void {}

export function handleOpen(event: Open): void {}

export function handleOpenBuyOrder(event: OpenBuyOrder): void {
  log.info("BuyOrder {}", [event.params.buyer.toHexString()])
  let orderId = event.params.buyer.toHex() + '' + event.params.batchId.toString()
  let buyOrder = BuyOrder.load(orderId)

  if (buyOrder == null) {
    buyOrder = new BuyOrder(orderId)
  } else {
    log.warning("Found existing buy order with claimed status: {}", [buyOrder.claimed ? 'true' : 'false;'])
  }

  buyOrder.buyer = event.params.buyer
  buyOrder.batchId = event.params.batchId
  buyOrder.claimed = false
  buyOrder.collateral = event.params.collateral
  buyOrder.fee = event.params.fee
  buyOrder.value = event.params.value
  buyOrder.save()
}

export function handleOpenSellOrder(event: OpenSellOrder): void {
  log.info("SellOrder from {}", [event.params.seller.toHexString()])
  let orderId = event.transaction.hash.toHex() + '' + event.logIndex.toString()
  let sellOrder = SellOrder.load(orderId)

  if (sellOrder == null) {
    sellOrder = new SellOrder(orderId)
  } else {
    log.warning("Found existing sell order with claimed status: {}", [sellOrder.claimed ? 'true' : 'false;'])
  }

  sellOrder.seller = event.params.seller
  sellOrder.batchId = event.params.batchId
  sellOrder.claimed = false
  sellOrder.collateral = event.params.collateral
  sellOrder.amount = event.params.amount
  sellOrder.save()
}

export function handleClaimBuyOrder(event: ClaimBuyOrder): void {
  log.info("BuyOrder claimed from {}", [event.params.buyer.toHexString()])
  let orderId = event.params.buyer.toHex() + '' + event.params.batchId.toString()
  let buyOrder = BuyOrder.load(orderId)

  if (buyOrder == null) {
    log.warning(
      "WARNING: Found non-indexed order with buyer {} and batchId {}",
      [
        event.params.buyer.toHex(),
        event.params.batchId.toString()
      ]
    )
    buyOrder = new BuyOrder(orderId)
  }

  buyOrder.claimed = true
  buyOrder.save()
}

export function handleClaimSellOrder(event: ClaimSellOrder): void {
  log.info("BuyOrder claimed from {}", [event.params.seller.toHexString()])
  let orderId = event.params.seller.toHex() + '' + event.params.batchId.toString()
  let sellOrder = SellOrder.load(orderId)

  if (sellOrder == null) {
    log.warning(
      "WARNING: Found non-indexed order with buyer {} and batchId {}",
      [
        event.params.seller.toHex(),
        event.params.batchId.toString()
      ]
    )
    sellOrder = new SellOrder(orderId)
  }

  sellOrder.claimed = true
  sellOrder.save()

}

export function handleClaimCancelledBuyOrder(
  event: ClaimCancelledBuyOrder
): void {}

export function handleClaimCancelledSellOrder(
  event: ClaimCancelledSellOrder
): void {}

export function handleUpdatePricing(event: UpdatePricing): void {}

export function handleScriptResult(event: ScriptResult): void {}

export function handleRecoverToVault(event: RecoverToVault): void {}
