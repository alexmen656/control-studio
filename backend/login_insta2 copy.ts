/* tslint:disable:no-console */
import { IgApiClient, IgLoginTwoFactorRequiredError } from 'instagram-private-api'
import inquirer from 'inquirer'
import 'dotenv/config'
import { get } from 'request-promise' // request is already declared as a dependency of the library
;(async () => {
  const ig = new IgApiClient()
  ig.state.generateDevice(process.env.IG_USERNAME)
  //ig.state.proxyUrl = process.env.IG_PROXY;

  try {
    // Normales Login
    const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD)
    console.log('Login erfolgreich!')
    /*
    const followersFeed = ig.feed.accountFollowers(auth.pk)
    const wholeResponse = await followersFeed.request()
    console.log(wholeResponse) // You can reach any properties in instagram response
    const items = await followersFeed.items()
    console.log(items) // Here you can reach items. It's array.
    const thirdPageItems = await followersFeed.items()
    // Feed is stateful and auto-paginated. Every subsequent request returns results from next page
    console.log(thirdPageItems) // Here you can reach items. It's array.
    const feedState = followersFeed.serialize() // You can serialize feed state to have an ability to continue get next pages.
    console.log(feedState)
    followersFeed.deserialize(feedState)
    const fourthPageItems = await followersFeed.items()
    console.log(fourthPageItems)
    // You can use RxJS stream to subscribe to all results in this feed.
    // All the RxJS powerful is beyond this example - you should learn it by yourself.
    followersFeed.items$.subscribe(
      (followers) => console.log(followers),
      (error) => console.error(error),
      () => console.log('Complete!'),
    )

*/
    //;async () => {
    /*  const ig = new IgApiClient()
      ig.state.generateDevice(process.env.IG_USERNAME)
      ig.state.proxyUrl = process.env.IG_PROXY
       const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD)*/
    console.log(JSON.stringify(auth))

    // getting random square image from internet as a Buffer
    const imageBuffer = await get({
      url: 'https://picsum.photos/800/800', // random picture with 800x800 size
      encoding: null, // this is required, only this way a Buffer is returned
    })

    const publishResult = await ig.publish.photo({
      file: imageBuffer, // image buffer, you also can specify image from your disk using fs
      caption: 'Really nice photo from the internet! 💖', // nice caption (optional)
    })

    console.log(publishResult) // publishResult.status should be "ok"
    //}
  } catch (err: any) {
    if (err instanceof IgLoginTwoFactorRequiredError) {
      const { username, totp_two_factor_on, two_factor_identifier } =
        err.response.body.two_factor_info
      const verificationMethod = totp_two_factor_on ? '0' : '1'

      const { code } = await inquirer.prompt([
        {
          type: 'input',
          name: 'code',
          message: `Enter code received via ${verificationMethod === '1' ? 'SMS' : 'TOTP'}`,
        },
      ])

      await ig.account.twoFactorLogin({
        username,
        verificationCode: code,
        twoFactorIdentifier: two_factor_identifier,
        verificationMethod,
        trustThisDevice: '1',
      })

      console.log('2FA Login erfolgreich!')
    } else {
      console.error('Ein Fehler ist aufgetreten:', err)
    }
  }
})()
