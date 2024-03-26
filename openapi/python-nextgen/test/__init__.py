import scicat_openapi_client as soc

configuration = soc.Configuration(
    host="http://localhost:3000"
)
api_client = soc.ApiClient(configuration)

users = {
    'admin': soc.CredentialsDto(username='admin', password='am2jf70TPNZsSan'),
    'ingestor': soc.CredentialsDto(username='ingestor', password='aman'),
    'proposalIngestor': soc.CredentialsDto(
        username='proposalIngestor',
        password='aman'),
    'archiveManager': soc.CredentialsDto(
        username='archiveManager',
        password='aman'),
    'user1': soc.CredentialsDto(
        username='user2',
        password='a609316768619f154ef58db4d847b75e'),
    'user2': soc.CredentialsDto(
        username='user2',
        password='f522d1d715970073a6413474ca0e0f63'),
    #
    'nouser': soc.CredentialsDto(
        username='nouser',
        password='f522d1d715970073a6413474ca0e0f63'),
}


def login(api, user: str):
    auth_api = soc.AuthApi(api_client)
    login_dto = auth_api.auth_controller_login(users[user])
    api.api_client.configuration.access_token = login_dto.access_token


def logout(api):
    api.api_client.configuration.access_token = ""
