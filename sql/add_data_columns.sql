-- Add new columns to spots table
-- Price range, view count, like count, full address

-- Add price_range column
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS price_range TEXT DEFAULT 'Mid';

-- Add view_count column
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add like_count column
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Add full_address column
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS full_address TEXT;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_spots_price_range ON spots(price_range);
CREATE INDEX IF NOT EXISTS idx_spots_view_count ON spots(view_count DESC);

-- Add comments
COMMENT ON COLUMN spots.price_range IS 'Budget (<20k), Mid (20-50k), Premium (>50k)';
COMMENT ON COLUMN spots.view_count IS 'YouTube video view count';
COMMENT ON COLUMN spots.like_count IS 'YouTube video like count';
COMMENT ON COLUMN spots.full_address IS 'Full address from video description';
