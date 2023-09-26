export default [
  // {
  //   "proposal" : {
  //     "created_at" : 0,
  //     "details"    : "n/a",
  //     "network" : "regtest",
  //     "paths"   : [
  //       [ "settle", 90000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ],
  //       [ "return", 90000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ]
  //     ],
  //     "payments" : [
  //       [ 10000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ]
  //     ],
  //     "schedule": {
  //       "deadline" : 7200,
  //       "duration" : 7200,
  //       "expires"  : 7200,
  //       "onclose"  : "settle",
  //       "onexpire" : "settle"
  //     },
  //     "terms" : [
  //       [ "dispute", "settle", "signature", 1, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be" ],
  //       [ "resolve", "*",      "signature", 1, "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e" ],
  //       [ "resolve", "*",      "signature", 2, "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e" ],
  //       [ "close",   "*",      "signature", 2, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be", "4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10" ]
  //     ],
  //     "title"   : "Basic two-party contract plus arbitrator.",
  //     "value"   : 100000,
  //     "version" : 1
  //   },
  //   "agent" : {
  //     "prop_id"     : "c346aeab5f54b46b76500356a7e92a988d8e6c1f5544a232d5f7f82d4b610158",
  //     "created_at"  : 0,
  //     "payments"    : [[ 1000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ]],
  //     "pnonce"      : "62bb85c0fedcc8f4b56fe6141c89272601358fbdf60afc644cc2aebf7393a0afc32432423a50abbebe2108d8e6f855f8021106be278934ef260edf7a796a95b8",
  //     "pubkey"      : "c7f6c6742c0d61897141bea4f9a38d9dc312a0ef17586f79362ee0f1b879a897",
  //     "seckey"      : "8fb24bdc7d7933cd67be5a64c1b32853c401af1c68a9364ef007d6a5ba5894f5"
  //   },
  //   "deposits" : [
  //     {
  //       "address"   : "bcrt1pw3atnwhk5jv5r5cuxzcxu0he4jrnd55uc56gldats5y6d8upx89quladft",
  //       "amount"    : 105000,
  //       "group_pub" : "747ab9baf6a49941d31c30b06e3ef9ac8736d29cc5348fb7ab8509a69f8131ca",
  //       "pnonce"    : "983880025495f35372a1cf23d346ce6955c7e499ce596de418314426e9296ad81f83536b3c0feb37c9d18c119cec29d8605f6589eac49f0269b59a71bc8a0da8",
  //       "pubkey"    : "3863227cea7437c163c3565ad54630da7a5bc68a5ed2f74f1eb4e10054133e31",
  //       "seckey"    : "b39a4d906013c909909adb3c40ba23a3200253fca52ca08895554eef79cec16d",
  //       "wallet_id" : "deposit_alice"
  //     }
  //   ]
  // },
  {
    "proposal" : {
      "created_at" : 0,
      "details"    : "n/a",
      "network" : "regtest",
      "paths"   : [
        [ "settle", 10000, "bcrt1p4pks09mtefdk96nhnk7y6j4shp9z86qqw2rzsuvq6gfurtsmx9ksn04zpc" ],
        [ "settle", 10000, "bcrt1pl27xkayz5a56j6xvuzvkz5vn7gqlkecs2w8l06jxzycl8ngdzh6qpkgggk" ],
        [ "settle", 10000, "bcrt1paddh60melfsghx32cf5t59wmak2y25e55ch7t6pxs4n37eg7zllseh2fye" ],
        [ "settle", 10000, "bcrt1p4sun2qhwt2us76ghf0cma93kg92taawsvu9ecuy3tq9tzz2uxtvscwvw9q" ],
        [ "refund", 10000, "bcrt1p3lp0uleq0l3lyvgz0up6n4mpqtgjv8z89agegh0xglmjhyj6m3nqgcv665" ],
        [ "refund", 10000, "bcrt1pxkysrgu0spu4qtwan8ahcqey4nh0jl62s3q4r5zkha6egsl40g3scjc87y" ],
        [ "refund", 10000, "bcrt1pxt6ujae2yz5veaelxc9kawpzq6sjyj6kq9cde0n78kqyw9j67mzqknlx6q" ],
        [ "refund", 10000, "bcrt1pky386905valjvnm8t80lhq0zuygdxgtd58ggw0jj5099xx3yypfsccmr5f" ]
      ],
      "payments" : [
        [ 1000, "bcrt1phx3qq0j7j0mpcn4geapryt2c2qpkjameknxehj6ujp4ldg36m8ss895p4a" ],
        [ 1000, "bcrt1pdvfnkq9prx8sv7slyy9dw36rg7yfc9u6xln9mn7m4zqdttqytxjqgqlfwf" ]
      ],
      "schedule": {
        "deadline" : 7200,
        "duration" : 7200,
        "expires"  : 7200,
        "onclose"  : "settle",
        "onexpire" : "settle"
      },
      "terms" : [
        [ "dispute",       "settle", "signature", 1, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be" ],
        [ "resolve",       "*",      "signature", 1, "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e" ],
        [ "close|resolve", "*",      "signature", 2, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be", "4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10" ]
      ],
      "title"   : "Example coin mixing contract.",
      "value"   : 42000,
      "version" : 1
    },
    "agent" : {
      "prop_id"     : "c346aeab5f54b46b76500356a7e92a988d8e6c1f5544a232d5f7f82d4b610158",
      "created_at"  : 0,
      "payments"    : [
        [ 1200, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ],
        [ 520,  "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ]
      ],
      "pnonce"      : "0b817b610b7955d793827eef5917d6aab497846486bbef5e325601b79de18502e08970361c953a57cd4627f6ddafc21c9eff2cca67b5fd3b5496e525106f341d",
      "pubkey"      : "2a578114bac3d8c2a5db42de9c0b1d9afb5be3ff80d7f62b07514bfcdbd8b973",
      "seckey"      : "d5b66a7d29f9f70278230ef11ab75654579a7020e70c7712fcfe1d1ae4bf5952"
    },
    "deposits" : [
      {
        "address"   : "bcrt1pj3w97mpxcrerp0y2cmx9j7yzm2dwyuum2v2wnm7dzxmp6fjwhaqsy9k6qf",
        "amount"    : 12000,
        "group_pub" : "747ab9baf6a49941d31c30b06e3ef9ac8736d29cc5348fb7ab8509a69f8131ca",
        "pnonce"    : "434d6ad50caa9c589cc724b84e66932d7acfd0c48a9f4e2caf380ef3cfb0828d90123da084b8a63c648e5bd09f6c112bf4b514f2947127597a1d4c12ff21d7ef",
        "pubkey"    : "ac702c109a871aa6397257f56a3dde7e2a2f56aa6e12182dea84610303ead600",
        "seckey"    : "6b3edfc6ef38ed19204d3c3508029a4f452001eeabe23c597135611e55dd03a2",
        "wallet_id" : "deposit_alice"
      },
      {
        "address"   : "bcrt1pdw96uq5xqmapxh8ey42nn4spxalrssafzl7h72cj3ws6277656hsxax8j7",
        "amount"    : 12000,
        "group_pub" : "747ab9baf6a49941d31c30b06e3ef9ac8736d29cc5348fb7ab8509a69f8131ca",
        "pnonce"    : "edb309b956baed32b05137d43a290a4ba6aa31746863ced1cd4de3a70c3ef84394a8b206960f9f8a625908584df67319624a6ddbc58b417e17c3cbac300bc93e",
        "pubkey"    : "9f15fc8dd35e67f29be44e1394c136f5d36d808dfc9d4f3c26fc79fae0a66a3c",
        "seckey"    : "4cd67dac34c1fc38cbc85ed68ca97ef1a695393db1fc6c711bbfd800c64eb061",
        "wallet_id" : "deposit_bob"
      },
      {
        "address"   : "bcrt1pllqhkfv7n4h6px63v2zhfpzz2uyglgdukpscud0er5vlpvqtf2ws7eyl9r",
        "amount"    : 12000,
        "group_pub" : "747ab9baf6a49941d31c30b06e3ef9ac8736d29cc5348fb7ab8509a69f8131ca",
        "pnonce"    : "c9a7242f077447a16861c29481fcf5ac46d33ac8b712c5af5e3b81cdb4078f362a9d47f46afef39a9e62c61505cdf9103d6c2ead349454dbc17dfa8521bdfe43",
        "pubkey"    : "8fd6f98cdc5b96bf876a7e49505d0e917afcb89e94a3d4313dd54b5d5398d096",
        "seckey"    : "94f38767dd4db643cb0c1e4cf3bf15b5382b137064f509bd5278d76bf9b1c5e4",
        "wallet_id" : "deposit_carol"
      },
      {
        "address"   : "bcrt1pdw96uq5xqmapxh8ey42nn4spxalrssafzl7h72cj3ws6277656hsxax8j7",
        "amount"    : 12000,
        "group_pub" : "747ab9baf6a49941d31c30b06e3ef9ac8736d29cc5348fb7ab8509a69f8131ca",
        "pnonce"    : "69221c7bd47bcd29e25f7c34ba1cf7a863c2953323a0d2a0923ac5410a2feab8c1d79e85854fc72f444961480e924b5c1f1b2840aadb139a52c611c417e1483e",
        "pubkey"    : "776f739d65bdff338b7924d77e24bcc170ef0fed43354794e8f0464291b534b0",
        "seckey"    : "526ba2ef6b8fb3249051c463db3b28f9c1910f06ae79e0d8da3c3124d7258608",
        "wallet_id" : "deposit_david"
      }
    ]
  }
]
