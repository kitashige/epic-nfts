const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("MyEpicNFT contract", function () {

    async function deployTokenFixture() {
        // Get the ContractFactory and Signers here.
        const myEpicNFT = await ethers.getContractFactory("MyEpicNFT");
        const [owner, addr1, addr2] = await ethers.getSigners();

        // To deploy our contract, we just have to call Token.deploy() and await
        // its deployed() method, which happens onces its transaction has been
        // mined.
        const hardhatToken = await myEpicNFT.deploy();

        await hardhatToken.deployed();

        // Fixtures can return anything you consider useful for your tests
        return { myEpicNFT, hardhatToken, owner, addr1, addr2 };
    }

    describe("Royalty Test", function () {

        it("Default Royalty Test", async function () {
            const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

            const expectedAddress = owner.address;
            const fee = 500;
            const tokenId = 1;
            const salePrice = 1000;
            const expectedRoyalty = (salePrice * fee) / 10000;
            var royaltyInfo = await hardhatToken.royaltyInfo(tokenId, salePrice);

            //check default royalty
            expect(royaltyInfo[0]).to.equal(expectedAddress);
            expect(royaltyInfo[1]).to.equal(expectedRoyalty);

        });

        it("Change Royalty Test", async function () {
            const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);

            const expectedAddress = addr1.address;
            const fee = 100;
            const tokenId = 10;
            const salePrice = 1000;
            const expectedRoyaltyAmount = (salePrice * fee) / 10000;

            //change royalty
            await hardhatToken.setRoyaltyFee(fee);
            await hardhatToken.setRoyaltyAddress(expectedAddress);

            //check changed royalty
            var royaltyInfo = await hardhatToken.royaltyInfo(tokenId, salePrice);
            expect(royaltyInfo[0]).to.equal(expectedAddress);
            expect(royaltyInfo[1]).to.equal(expectedRoyaltyAmount);

        });

    });

    describe("Mint Test", function () {
        it("Total Mint Test OK", async function () {
            const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);
            var totalMintCount = 100;
            for (let index = 0; index < totalMintCount; index++) {
                // makeAnEpicNFT 関数を呼び出す。NFT が Mint される。
                let txn = await hardhatToken.makeAnEpicNFT({
                    value: ethers.utils.parseEther("0.001"),
                });
                // Minting が仮想マイナーにより、承認されるのを待つ。
                await txn.wait();
            }
        });
        it("Total Mint Test NG", async function () {
            const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);
            var totalMintCount = 100;
            for (let index = 0; index < totalMintCount; index++) {
                // makeAnEpicNFT 関数を呼び出す。NFT が Mint される。
                let txn = await hardhatToken.makeAnEpicNFT({
                    value: ethers.utils.parseEther("0.001"),
                });
                // Minting が仮想マイナーにより、承認されるのを待つ。
                await txn.wait();
            }
            //101個目をミントしてエラーになること
            await expect(hardhatToken.makeAnEpicNFT({
                value: ethers.utils.parseEther("0.001"),
            })).to.be.rejected
        });
    });


});