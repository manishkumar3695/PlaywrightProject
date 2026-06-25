import { Page } from '@playwright/test';
import { TestPage } from '../locators/test.locator';
import { SauceDemoPage } from '../locators/sauceDemoPage';

export class PageManager {
    constructor(private page: Page) { }

    private _testPage?: TestPage;
    private _sauceDemoPage?: SauceDemoPage;


    get testPage(): TestPage {
        if (!this._testPage) {
            this._testPage = new TestPage(this.page);
        }
        return  this._testPage;
    }

    get sauceDemoPage(): SauceDemoPage {
        if (!this._sauceDemoPage) {
            this._sauceDemoPage = new SauceDemoPage(this.page);
        }
        return this._sauceDemoPage;
    }
}
