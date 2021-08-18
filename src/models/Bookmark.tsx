export class Bookmark {
    uuid: string = '';
    issuer: string = '';
    account: string = '';
    secret: string = '';

    constructor(obj: Bookmark) {
        this.uuid = obj.uuid;
        this.issuer = obj.issuer;
        this.account = obj.account;
        this.secret = obj.secret;
    }
}
