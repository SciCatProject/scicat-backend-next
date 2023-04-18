describe("Admin functionalities", () => {
  it("Should be able to get frontend config", async () => {
    return request(appUrl)
      .get("/api/v3/admin/config")
      .set("Accept", "application/json")
      .then((res) => {
        res.body.should.not.equal(null);
        res.body.should.have.property("facility");
      });
  });

  it("Should be able to get frontend theme config", async () => {
    return request(appUrl)
      .get("/api/v3/admin/theme")
      .set("Accept", "application/json")
      .then((res) => {
        res.body.should.not.equal(null);
        res.body.should.have.property("name");
        res.body.should.have.property("properties");
      });
  });
});
