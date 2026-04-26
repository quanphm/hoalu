-- Install pgcrypto extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- nanoid() — identical algorithm to JS nanoid (bitmask, rejection sampling)
CREATE OR REPLACE FUNCTION nanoid(
    size int DEFAULT 21,
    alphabet text DEFAULT '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    additionalBytesFactor float DEFAULT 1.6
)
    RETURNS text LANGUAGE plpgsql VOLATILE PARALLEL SAFE AS $$
DECLARE
    alphabetArray  text[];
    alphabetLength int := 64;
    mask           int := 63;
    step           int := 34;
BEGIN
    IF size IS NULL OR size < 1 THEN
        RAISE EXCEPTION 'The size must be defined and greater than 0!';
    END IF;
    IF alphabet IS NULL OR length(alphabet) = 0 OR length(alphabet) > 255 THEN
        RAISE EXCEPTION 'The alphabet can''t be undefined, zero or bigger than 255 symbols!';
    END IF;
    IF additionalBytesFactor IS NULL OR additionalBytesFactor < 1 THEN
        RAISE EXCEPTION 'The additional bytes factor can''t be less than 1!';
    END IF;
    alphabetArray := regexp_split_to_array(alphabet, '');
    alphabetLength := array_length(alphabetArray, 1);
    mask := (2 << cast(floor(log(alphabetLength - 1) / log(2)) as int)) - 1;
    step := cast(ceil(additionalBytesFactor * mask * size / alphabetLength) AS int);
    IF step > 1024 THEN step := 1024; END IF;
    RETURN nanoid_optimized(size, alphabet, mask, step);
END
$$;

CREATE OR REPLACE FUNCTION nanoid_optimized(
    size int,
    alphabet text,
    mask int,
    step int
)
    RETURNS text LANGUAGE plpgsql VOLATILE PARALLEL SAFE AS $$
DECLARE
    idBuilder      text := '';
    counter        int  := 0;
    bytes          bytea;
    alphabetIndex  int;
    alphabetArray  text[];
    alphabetLength int  := 64;
BEGIN
    alphabetArray := regexp_split_to_array(alphabet, '');
    alphabetLength := array_length(alphabetArray, 1);
    LOOP
        bytes := gen_random_bytes(step);
        FOR counter IN 0..step - 1 LOOP
            alphabetIndex := (get_byte(bytes, counter) & mask) + 1;
            IF alphabetIndex <= alphabetLength THEN
                idBuilder := idBuilder || alphabetArray[alphabetIndex];
                IF length(idBuilder) = size THEN
                    RETURN idBuilder;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END
$$;--> statement-breakpoint

-- Add column (nullable first for backfill)
ALTER TABLE "expense" ADD COLUMN "public_id" text;--> statement-breakpoint

-- Backfill with 'ex_' + 16-char nanoid using Hoalu's exact alphabet
UPDATE "expense" SET "public_id" = 'ex_' || nanoid(16, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');--> statement-breakpoint

-- Enforce constraints
ALTER TABLE "expense" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_public_id_unique" UNIQUE("public_id");
