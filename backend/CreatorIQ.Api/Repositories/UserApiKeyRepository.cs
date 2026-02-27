using CreatorIQ.Api.Data;
using CreatorIQ.Api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CreatorIQ.Api.Repositories
{
    public interface IUserApiKeyRepository
    {
        Task<UserApiKey?> GetByUserAndProvider(string userId, string provider);
        Task<List<UserApiKey>> GetAllForUser(string userId);
        Task<UserApiKey> Upsert(string userId, string provider, string encryptedKey, string keyHint, string modelPreference);
        Task<bool> Delete(string userId, string provider);
        Task MarkVerified(string userId, string provider);
        Task<UserConductorPreferences?> GetPreferences(string userId);
        Task<UserConductorPreferences> UpsertPreferences(string userId, string activeProvider, string activeModel, string? fallbackProvider, string? fallbackModel, bool streamingEnabled);
    }

    public class UserApiKeyRepository : IUserApiKeyRepository
    {
        private readonly AppDbContext _context;

        public UserApiKeyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserApiKey?> GetByUserAndProvider(string userId, string provider)
        {
            return await _context.UserApiKeys
                .FirstOrDefaultAsync(k => k.UserId == userId && k.Provider == provider);
        }

        public async Task<List<UserApiKey>> GetAllForUser(string userId)
        {
            return await _context.UserApiKeys
                .Where(k => k.UserId == userId)
                .ToListAsync();
        }

        public async Task<UserApiKey> Upsert(string userId, string provider, string encryptedKey, string keyHint, string modelPreference)
        {
            var existing = await GetByUserAndProvider(userId, provider);
            if (existing != null)
            {
                existing.EncryptedKey = encryptedKey;
                existing.KeyHint = keyHint;
                existing.ModelPreference = modelPreference;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.UserApiKeys.Update(existing);
                await _context.SaveChangesAsync();
                return existing;
            }

            var newKey = new UserApiKey
            {
                UserId = userId,
                Provider = provider,
                EncryptedKey = encryptedKey,
                KeyHint = keyHint,
                ModelPreference = modelPreference
            };
            _context.UserApiKeys.Add(newKey);
            await _context.SaveChangesAsync();
            return newKey;
        }

        public async Task<bool> Delete(string userId, string provider)
        {
            var key = await GetByUserAndProvider(userId, provider);
            if (key == null) return false;

            _context.UserApiKeys.Remove(key);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task MarkVerified(string userId, string provider)
        {
            var key = await GetByUserAndProvider(userId, provider);
            if (key != null)
            {
                key.Verified = true;
                key.LastVerifiedAt = DateTime.UtcNow;
                key.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<UserConductorPreferences?> GetPreferences(string userId)
        {
            return await _context.ConductorPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<UserConductorPreferences> UpsertPreferences(string userId, string activeProvider, string activeModel, string? fallbackProvider, string? fallbackModel, bool streamingEnabled)
        {
            var existing = await GetPreferences(userId);
            if (existing != null)
            {
                existing.ActiveProvider = activeProvider;
                existing.ActiveModel = activeModel;
                existing.FallbackProvider = fallbackProvider;
                existing.FallbackModel = fallbackModel;
                existing.StreamingEnabled = streamingEnabled;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.ConductorPreferences.Update(existing);
                await _context.SaveChangesAsync();
                return existing;
            }

            var newPrefs = new UserConductorPreferences
            {
                UserId = userId,
                ActiveProvider = activeProvider,
                ActiveModel = activeModel,
                FallbackProvider = fallbackProvider,
                FallbackModel = fallbackModel,
                StreamingEnabled = streamingEnabled
            };
            _context.ConductorPreferences.Add(newPrefs);
            await _context.SaveChangesAsync();
            return newPrefs;
        }
    }
}
