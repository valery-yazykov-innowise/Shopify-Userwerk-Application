<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Models\ScriptTag;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;
use App\Models\Session;

class AppUninstalled implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::debug("App was uninstalled from $shop - removing all sessions and scripts");
        $file = ScriptTag::where('shop', $shop)->value('script_file');
        unlink($file);
        ScriptTag::where('shop', $shop)->delete();
        Session::where('shop', $shop)->delete();
    }
}
