import hashlib
import datetime
import collections
import binascii
import Crypto
import Crypto.Random

# import Cryptodome.Random
from Crypto.Hash import SHA
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5


class Client:
    def __init__(self):
        random = Crypto.Random.new().read
        self._private_key = RSA.generate(1024, random)
        self._public_key = self._private_key.publickey()
        self._signer = PKCS1_v1_5.new(self._private_key)

    @property
    def identity(self):
        return binascii.hexlify(self._public_key.exportKey(format='DER')).decode('ascii')


class Transaction:
    def __init__(self, sender, recipient, value):
        self.sender = sender
        self.recipient = recipient
        self.value = value
        self.time = str(datetime.datetime.now())

    def to_dict(self):
        if self.sender == "Genesis":
            sender_identity = "Genesis"
        else:
            sender_identity = self.sender.identity

        recipient_identity = self.recipient.identity
        transaction_value = self.value

        return collections.OrderedDict({
            'sender': sender_identity,
            'recipient': recipient_identity,
            'value': transaction_value,
            'time': self.time
        })

    def sign_transaction(self):
        private_key = self.sender._private_key
        signer = PKCS1_v1_5.new(private_key)
        h = SHA.new(str(self.to_dict()).encode('utf8'))
        return binascii.hexlify(signer.sign(h)).decode('ascii')


def sha256(message):
    return hashlib.sha256(message.encode()).hexdigest()


class Block:
    def __init__(self, verified_transactions, previous_block_hash, nonce):
        self.verified_transactions = verified_transactions
        self.previous_block_hash = previous_block_hash
        self.nonce = nonce
        self.block_data = f"{' - '.join(verified_transactions)} - {previous_block_hash} - {nonce}"
        self.block_hash = sha256(self.block_data)


def mine(transactions, previous_block_hash, difficulty=2):
    nonce_limit = 10 ** 10
    prefix = '0' * difficulty

    for nonce in range(nonce_limit):
        block = Block(transactions, previous_block_hash, nonce)
        digest = block.block_hash

        if digest.startswith(prefix):
            return block

    return None
