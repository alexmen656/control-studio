/* tslint:disable:no-console */
import { IgApiClient, IgLoginTwoFactorRequiredError } from 'instagram-private-api'
import inquirer from 'inquirer'
import 'dotenv/config'
import rp from 'request-promise';
const { get } = rp;

const instagramPost = async () => {
  const ig = new IgApiClient()
  ig.state.generateDevice(process.env.IG_USERNAME)

  try {
    const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD)
    console.log('Login erfolgreich!')

    const imageBuffer = await get({
      url: 'https://picsum.photos/800/800',
      encoding: null,
    })

    const publishResult = await ig.publish.photo({
      file: imageBuffer,
      caption: 'Really nice photo from the internet! 💖',
    })

    console.log(publishResult)
  } catch (error) {
    if (error instanceof IgLoginTwoFactorRequiredError) {
      const { username, totp_two_factor_on, two_factor_identifier } =
        error.response.body.two_factor_info
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
}

export { instagramPost }
