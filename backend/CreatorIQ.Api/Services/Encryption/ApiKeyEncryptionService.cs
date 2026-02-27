using Microsoft.AspNetCore.DataProtection;
using System;

namespace CreatorIQ.Api.Services.Encryption
{
    public interface IApiKeyEncryptionService
    {
        string Encrypt(string rawKey);
        string Decrypt(string encryptedKey);
        string GetKeyHint(string rawKey);
        bool ValidateKeyFormat(string provider, string rawKey);
    }

    public class ApiKeyEncryptionService : IApiKeyEncryptionService
    {
        private readonly IDataProtector _protector;

        public ApiKeyEncryptionService(IDataProtectionProvider provider)
        {
            _protector = provider.CreateProtector("CreatorIQ.UserApiKeys.v1");
        }

        public string Encrypt(string rawKey) => _protector.Protect(rawKey);
        public string Decrypt(string encryptedKey) => _protector.Unprotect(encryptedKey);
        public string GetKeyHint(string rawKey) =>
            rawKey.Length >= 4 ? rawKey[^4..] : "????";

        public bool ValidateKeyFormat(string provider, string rawKey)
        {
            if (!CreatorIQ.Api.Services.Conductor.ProviderRegistry.Providers.TryGetValue(provider, out var config))
                return false;
            return rawKey.StartsWith(config.KeyPrefix, StringComparison.OrdinalIgnoreCase);
        }
    }
}
