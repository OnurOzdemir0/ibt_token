module ibt_coin::ibt_token;

use sui::coin::{Self, TreasuryCap, Coin};

public struct IBT_TOKEN has drop {}

fun init(witness: IBT_TOKEN, ctx: &mut TxContext) {
		let (treasury, metadata) = coin::create_currency(
				witness,
				6,
				b"IBT_TOKEN",
				b"",
				b"",
				option::none(),
				ctx,
		);
		transfer::public_freeze_object(metadata);
		transfer::public_transfer(treasury, ctx.sender())
}

public fun mint(
    treasury_cap: &mut TreasuryCap<IBT_TOKEN>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
}

public fun burn(
	coin: Coin<IBT_TOKEN>,
	ctx: &mut TxContext,
) {
	let burn_address = @0x02c34bee7bc8d90f22da8469b05e714e6b41395d3f47d5f3c4491041fd19e315;
	transfer::public_transfer(coin, burn_address);
}