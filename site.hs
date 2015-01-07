{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}

import Control.Monad.Reader
import Control.Applicative
import System.FilePath
import System.Locale
import Hakyll


newtype SingleMetadata a = SingleMetadata (Reader Metadata a)
  deriving (Functor, Applicative, Monad, MonadReader Metadata)

runSingleMetadata :: SingleMetadata a -> Metadata -> a
runSingleMetadata (SingleMetadata x) m = runReader x m

instance MonadMetadata SingleMetadata where
  getMetadata = const $ ask 
  getMatches = const $ return []

niceRoute :: String -> Routes
niceRoute prefix =
  metadataRoute $ \metadata ->
    customRoute $ \ident ->
      let date = runSingleMetadata $ getItemUTC defaultTimeLocale ident
      in prefix ++ (takeBaseName . toFilePath $ ident) ++ "/index.html"

main :: IO ()
main = hakyll $ do
  match "assets/*" $ do
    route idRoute
    compile copyFileCompiler

  match "_posts/*" $ do
    route $ niceRoute "/blog"
    compile copyFileCompiler
