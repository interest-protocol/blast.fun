import assert from "node:assert/strict"
import test from "node:test"
import { isVestingActionDisabled } from "./vesting.utils.ts"

test("allows a fully unlocked zero-balance vesting position to be finished", () => {
	assert.equal(
		isVestingActionDisabled({
			claimableAmount: "0",
			hasStarted: true,
			isFullyUnlocked: true,
		}),
		false
	)
})

test("keeps an active position disabled until tokens are claimable", () => {
	assert.equal(
		isVestingActionDisabled({
			claimableAmount: "0",
			hasStarted: true,
			isFullyUnlocked: false,
		}),
		true
	)
})

test("enables an active position when tokens are claimable", () => {
	assert.equal(
		isVestingActionDisabled({
			claimableAmount: "1",
			hasStarted: true,
			isFullyUnlocked: false,
		}),
		false
	)
})
