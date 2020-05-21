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
import { BuyOrder, SellOrder } from "../generated/schema"

export function handleUpdateBeneficiary(event: UpdateBeneficiary): void {}

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
  log.info("BuyOrder from address {}", [event.params.buyer.toHexString()])
  // What's the deal behind this?
  // For being able to diff if an order is claimed or unclaimed, we need a reproducible
  // and unique id, that can be built from the event parameters. Here, we use the id of
  // the buyer / seller, and the batch ID. We're assuming there can never be more than 1
  // order made with the same batch id, by the same address.
  let orderId = event.params.buyer.toHex() + '' + event.params.batchId.toString()
  let buyOrder = BuyOrder.load(orderId)

  if (buyOrder == null) {
    buyOrder = new BuyOrder(orderId)
  } else {
    log.warning(
      "Found existing buy order with claimed status: {}, batch id {}, seller {}, amount {}. The event found batchId {}, seller {}, amount {}",
      [
        buyOrder.claimed ? 'true' : 'false',
        buyOrder.batchId.toString(),
        buyOrder.buyer.toHex(),
        buyOrder.collateral.toString(),
        event.params.batchId.toString(),
        event.params.buyer.toHex(),
        event.params.collateral.toString(),
      ]
    )
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
  let orderId = event.params.seller.toHex() + '' + event.params.batchId.toString()
  let sellOrder = SellOrder.load(orderId)

  if (sellOrder == null) {
    sellOrder = new SellOrder(orderId)
  } else {
    log.warning(
      "Found existing sell order with claimed status: {}, batch id {}, seller {}, amount {}. The event found batchId {}, seller {}, amount {}",
      [
        sellOrder.claimed ? 'true' : 'false',
        sellOrder.batchId.toString(),
        sellOrder.seller.toHex(),
        sellOrder.amount.toString(),
        event.params.batchId.toString(),
        event.params.seller.toHex(),
        event.params.amount.toString(),
      ]
    )
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

  // If this happens, there's a problem with the state reducing,
  // as this should be impossible. For every ClaimBuyOrder event, there should always be
  // OpenBuyOrder event. This code is here so the subgraph automatically stops reducing
  // as soon as this condition is reached, if it ever does happen.
  // Note: this will happen due to the new buyOrder entry having missing non-nullable properties.
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
      "WARNING: Found non-indexed order with seller {} and batchId {}",
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
