"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-console */
var src_1 = require("../src");
var Bluebird = require("bluebird");
var inquirer = require("inquirer");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var ig;
    return __generator(this, function (_a) {
        ig = new src_1.IgApiClient();
        ig.state.generateDevice(process.env.IG_USERNAME);
        ig.state.proxyUrl = process.env.IG_PROXY;
        // Perform usual login
        // If 2FA is enabled, IgLoginTwoFactorRequiredError will be thrown
        return [2 /*return*/, Bluebird.try(function () { return ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD); })
                .catch(src_1.IgLoginTwoFactorRequiredError, function (err) { return __awaiter(void 0, void 0, void 0, function () {
                var _a, username, totp_two_factor_on, two_factor_identifier, verificationMethod, code;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = err.response.body.two_factor_info, username = _a.username, totp_two_factor_on = _a.totp_two_factor_on, two_factor_identifier = _a.two_factor_identifier;
                            verificationMethod = totp_two_factor_on ? '0' : '1' // default to 1 for SMS
                            ;
                            return [4 /*yield*/, inquirer.prompt([
                                    {
                                        type: 'input',
                                        name: 'code',
                                        message: "Enter code received via ".concat(verificationMethod === '1' ? 'SMS' : 'TOTP'),
                                    },
                                ])
                                // Use the code to finish the login process
                            ];
                        case 1:
                            code = (_b.sent()).code;
                            // Use the code to finish the login process
                            return [2 /*return*/, ig.account.twoFactorLogin({
                                    username: username,
                                    verificationCode: code,
                                    twoFactorIdentifier: two_factor_identifier,
                                    verificationMethod: verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
                                    trustThisDevice: '1', // Can be omitted as '1' is used by default
                                })];
                    }
                });
            }); })
                .catch(function (e) { return console.error('An error occurred while processing two factor auth', e, e.stack); })];
    });
}); })();
